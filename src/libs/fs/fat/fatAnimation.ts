import { fatActions } from './fatAction'
import type { FatFs } from './fatfs'
import type { FatItem } from './fatTable'
import type { DirectoryEntry } from './types'
import { addState, initInitialState } from '~/composables/animations'
import type { Disk } from '~/libs/volume'
import type { Actions } from '~/composables/actions'
import { actions as ractions, setStepsDesc } from '~/composables/actions'
import { FatItemState } from '~/libs/fs/fat'

export function fatAnimation(fs: FatFs, disk: Disk, actions: Actions) {
  return {
    create() {
      const createState = {
        firstFreeCluster: {} as FatItem,
        directoryEntry: {} as DirectoryEntry,
        selectedFatIndex: 0,
        fatItem: {} as FatItem,
        previousFatItem: {} as FatItem,
      }
      setStepsDesc(fatActions.create.steps)

      // scan root dir for repeated file name
      addState(() => {
        actions.state.stepIndex = 0
        fs.rootDirectory.files.forEach((file) => {
          addState(() => {
            actions.state.directory!.selected = [file.name]
            actions.state.msg = `Compare ${file.name} with ${actions.file.name}`
          })
        })
      })

      // init directory entry in root
      addState(() => {
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
      })

      addState(() => {
        actions.state.stepIndex = 2
      })
      for (const [i, fatItem] of fs.fatTable.table.entries()) {
        addState(() => {
          actions.state.fat!.selected = [i]
          actions.state.msg = `Check if fat ${i} is free`
        })
        if (fatItem.nextCluster === FatItemState.FREE_CLUSTER) {
          addState(() => {
            actions.state.fat!.flash = [i]
            actions.state.msg = `Free cluster found at ${i}`
            createState.directoryEntry.firstClusterNumber = fatItem.offset
            createState.fatItem = fatItem
            createState.selectedFatIndex = i
          })
          break
        }
      }

      addState(() => {
        actions.state.stepIndex = 3
        actions.state.msg = `Allocate cluster for ${actions.file.name}`
      })
      addState(() => {
        actions.state.msg = `Write file data into cluster ${createState.fatItem.offset}`
        actions.state.file!.flash = [0]
        actions.state.block!.selected = [createState.fatItem.offset]
      })
      addState(() => {
        actions.state.file!.flash = [0]
        actions.state.block!.selected = [createState.fatItem.offset]
        console.log(createState.fatItem)
        fs.allocateCluster(createState.fatItem, createState.directoryEntry)
        actions.file.currentSize--
      })
      addState(() => {
        actions.state.msg = `Set fat ${createState.selectedFatIndex}'s next cluster as EOF`
        createState.fatItem.setState(FatItemState.END_OF_CLUSTER, createState.directoryEntry.name, createState.directoryEntry.color)
      })
      addState(() => {
        actions.state.msg = 'Update first cluster number in directory entry'
        fs.updateFirstCluster(createState.directoryEntry.name, createState.selectedFatIndex)
      })

      addState(() => {
        actions.state.stepIndex = 4
      })

      for (let index = actions.file.size; index < actions.file.currentSize; index--) {

      }

      // addState(() => {
      //   while (actions.file.currentSize > 0) {
      //     addState(() => {
      //       createState.previousFatItem = createState.fatItem
      //       actions.state.stepIndex = 5
      //       for (const [i, fatItem] of fs.fatTable.table.entries()) {
      //         addState(() => {
      //           actions.state.fat!.selected = [i]
      //           actions.state.msg = `Check if fat ${i} is free`
      //         })
      //         if (fatItem.nextCluster === FatItemState.FREE_CLUSTER) {
      //           addState(() => {
      //             actions.state.fat!.flash = [i]
      //             actions.state.msg = `Free cluster found at ${i}`
      //             createState.fatItem = fatItem
      //             createState.selectedFatIndex = i
      //           })
      //           break
      //         }
      //       }

      //       addState(() => {
      //         actions.state.stepIndex = 6
      //         actions.state.msg = `Write file data into cluster ${createState.fatItem.offset}`
      //         actions.state.file!.flash = [0]
      //         actions.state.block!.selected = [createState.fatItem.offset]
      //       })
      //       addState(() => {
      //         actions.state.file!.flash = [0]
      //         actions.state.block!.selected = [createState.fatItem.offset]
      //         fs.allocateCluster(createState.firstFreeCluster, createState.directoryEntry)
      //         actions.file.currentSize--
      //       })
      //       addState(() => {
      //         actions.state.stepIndex = 7
      //         actions.state.msg = `Update previous fat (${createState.previousFatItem.offset})'s next cluster as ${createState.fatItem.offset}`
      //         createState.previousFatItem.nextCluster = createState.fatItem.offset
      //       })
      //     })
      //   }
      // })
      // addState(() => {
      //   actions.state.msg = 'All file data has been allocated'
      //   actions.state.stepIndex = 7
      // })
    },
  }
}
