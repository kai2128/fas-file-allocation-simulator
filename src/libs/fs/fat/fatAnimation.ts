import { fatActions } from './fatAction'
import type { FatFs } from './fatfs'
import type { FatItem } from './fatTable'
import type { DirectoryEntry } from './types'
import { addState, initInitialState } from '~/composables/animations'
import type { Disk } from '~/libs/volume'
import type { Actions } from '~/composables/actions'
import { FatItemState } from '~/libs/fs/fat'

export function fatAnimation() {
  const { actions, disk, fs } = initInitialState() as { actions: Actions; disk: Disk; fs: FatFs }

  return {
    create() {
      const createState = {
        firstFreeCluster: {} as FatItem,
      }

      setActions('create', { codes: fatActions.create.codes, steps: fatActions.create.steps })

      // scan root dir for repeated file name
      actions.state.stepIndex = 0
      fs.rootDirectory.files.forEach((file) => {
        actions.state.directory!.selected = [file.name]
        addState({ actions })
      })

      // init directory entry in root
      actions.state.stepIndex = 1
      const directoryEntry: DirectoryEntry = {
        name: actions.file.name,
        type: 'file',
        size: actions.file.currentSize,
        dateCreated: Date.now(),
      }
      fs.rootDirectory.files.push(directoryEntry)
      addState({ actions, fs })

      actions.state.stepIndex = 2
      for (const [i, fatItem] of fs.fatTable.table.entries()) {
        actions.state.fat!.selected = [i]
        if (fatItem.nextCluster === FatItemState.FREE_CLUSTER) {
          actions.state.fat!.flash = [i]
          directoryEntry.firstClusterNumber = fatItem.offset
          addState({ actions })
          break
        }
        addState({ actions })
      }

      actions.state.stepIndex = 3
      fs.updateFirstCluster(actions.file.name, directoryEntry.firstClusterNumber!)
      fs.allocateCluster(createState.firstFreeCluster, directoryEntry)
      firstFreeCluster
      actions.file.currentSize--
      addState({ actions, fs })

      actions.state.stepIndex = 4
      addState({ actions })
      while (actions.file.currentSize > 0) {
        const freeCluster = fs.fatTable.getNextFreeClusterItem()
        actions.state.fat?.selected = freeCluster?.color
        addState()
        fs.allocateCluster(freeCluster!)
        actions.file.currentSize--

      }
    },
  }
}
