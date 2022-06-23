import { fatActions } from './fatAction'
import type { FatFs } from './FatFs'
import type { FatItem } from './FatItem'
import type { DirectoryEntry } from './DirectoryEntry'
import { addState, initInitialState } from '~/composables/animations'
import type { Disk } from '~/libs/volume'
import type { Actions } from '~/composables/actions'
import { actions as ractions, setStepsDesc } from '~/composables/actions'
import { FatItemState } from '~/libs/fs/fat'

export function fatAnimation(fs: FatFs, disk: Disk, actions: Actions) {
  return {
    *create() {
      const createState = {
        firstFreeCluster: {} as FatItem,
        directoryEntry: {} as DirectoryEntry,
        selectedFatIndex: 0,
        fatItem: {} as FatItem,
        previousFatItem: {} as FatItem,
      }
      setStepsDesc(fatActions.create.steps)

      // scan root dir for repeated file name
      actions.state.stepIndex = 0
      yield { actions, disk, fs }
      for (const file of fs.rootDirectory.files) {
        actions.state.directory!.selected = [file.name]
        actions.state.msg = `Compare ${file.name} with ${actions.file.name}`
        yield { actions, disk, fs }
      }

      // init directory entry in root
      actions.state.stepIndex = 1
      createState.directoryEntry = {
        name: actions.file.name,
        type: 'file',
        size: actions.file.currentSize,
        dateCreated: Date.now(),
        firstClusterNumber: 1,
        color: actions.file.color,
      }
      fs.rootDirectory.files.push(createState.directoryEntry)
      yield { actions, disk, fs }

      actions.state.stepIndex = 2
      for (const [i, fatItem] of fs.fatTable.table.entries()) {
        actions.state.fat!.selected = [i]
        actions.state.msg = `Check if fat ${i} is free`
        yield { actions, disk, fs }

        if (fatItem.nextCluster === FatItemState.FREE_CLUSTER) {
          actions.state.fat!.flash = [i]
          actions.state.msg = `Free cluster found at ${i}`
          createState.directoryEntry.firstClusterNumber = fatItem.offset
          createState.fatItem = fatItem
          createState.selectedFatIndex = i
          yield { actions, disk, fs }
          break
        }
      }

      actions.state.stepIndex = 3
      actions.state.msg = `Allocate cluster for ${actions.file.name}`
      yield { actions, disk, fs }

      actions.state.msg = `Write file data into cluster ${createState.fatItem.offset}`
      actions.state.file!.flash = [0]
      actions.state.block!.selected = [createState.fatItem.offset]
      yield { actions, disk, fs }

      actions.state.file!.flash = [0]
      actions.state.block!.selected = [createState.fatItem.offset]
      fs.allocateCluster(createState.fatItem, createState.directoryEntry)
      actions.file.currentSize--
      yield { actions, disk, fs }

      actions.state.msg = `Set fat ${createState.selectedFatIndex}'s next cluster as EOF`
      createState.fatItem.setState(FatItemState.END_OF_CLUSTER, createState.directoryEntry.name, createState.directoryEntry.color)
      yield { actions, disk, fs }

      actions.state.msg = 'Update first cluster number in directory entry'
      fs.updateFirstCluster(createState.directoryEntry.name, createState.selectedFatIndex)
      yield { actions, disk, fs }

      actions.state.stepIndex = 4
      actions.state.block!.selected = []
      actions.state.fat!.flash = []
      yield { actions, disk, fs }

      while (actions.file.currentSize > 0) {
        createState.previousFatItem = createState.fatItem
        actions.state.stepIndex = 5
        yield { actions, disk, fs }

        for (const [i, fatItem] of fs.fatTable.table.entries()) {
          actions.state.fat!.selected = [i]
          actions.state.msg = `Check if fat ${i} is free`
          yield { actions, disk, fs }

          if (fatItem.nextCluster === FatItemState.FREE_CLUSTER) {
            actions.state.fat!.flash = [i]
            actions.state.msg = `Free cluster found at ${i}`
            createState.fatItem = fatItem
            createState.selectedFatIndex = i
            yield { actions, disk, fs }
            break
          }
        }

        actions.state.stepIndex = 6
        actions.state.msg = `Write file data into cluster ${createState.fatItem.offset}`
        actions.state.file!.flash = [0]
        actions.state.block!.selected = [createState.fatItem.offset]
        yield { actions, disk, fs }

        actions.state.file!.flash = [0]
        actions.state.block!.selected = [createState.fatItem.offset]
        fs.allocateCluster(createState.fatItem, createState.directoryEntry)
        actions.file.currentSize--
        yield { actions, disk, fs }

        createState.fatItem.markAsEndOfFile()
        actions.state.msg = `Mark current fat ${createState.selectedFatIndex} as EOF`
        yield { actions, disk, fs }

        actions.state.stepIndex = 7
        actions.state.msg = `Update previous fat ${createState.previousFatItem.offset}'s next cluster as ${createState.fatItem.offset}`
        createState.previousFatItem.nextCluster = createState.fatItem.offset
        resetActionsSelectedState(['block', 'fat'])
        yield { actions, disk, fs }
      }

      actions.state.msg = 'All file data has been allocated'
      actions.state.stepIndex = 7
      resetActionsSelectedState()
      yield { actions, disk, fs }
    },
  }
}
