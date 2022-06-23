import { isEmpty } from 'lodash-es'
import { setState } from './../../../composables/actions'
import { DirectoryEntry } from './directoryEntry'
import { fatActions } from './fatAction'
import type { FatFs } from './fatfs'
import type { FatItem } from './fatItem'
import type { Disk } from '~/libs/volume'
import { setMsg, setStepsDesc } from '~/composables/actions'
import type { Actions } from '~/composables/actions'

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
      if (isEmpty(fs.rootDirectory.files)) {
        setMsg('Directory has no files')
        yield { actions, disk, fs }
      }
      for (const file of fs.rootDirectory.files) {
        if (file.name === actions.file.name) {
          setMsg('File already exists', 'error')
          return
        }
        setState.directorySelected([file.name])
        setMsg(`Compare ${file.name} with ${actions.file.name}`)
        yield { actions, disk, fs }
      }

      // init directory entry in root
      actions.state.stepIndex = 1
      setMsg(`Create new directory entry for ${actions.file.name}`)
      createState.directoryEntry = new DirectoryEntry(actions.file.name, actions.file.size)
      fs.rootDirectory.files.push(createState.directoryEntry)
      yield { actions, disk, fs }

      actions.state.stepIndex = 2
      for (const [i, fatItem] of fs.fatTable.table.entries()) {
        setState.fatSelected([i])
        setMsg(`Check if fat ${i} is free`)
        yield { actions, disk, fs }

        if (fatItem.nextCluster === FatItemState.FREE_CLUSTER) {
          setState.fatFlash([i])
          setMsg(`Free cluster found at ${i}`)
          createState.fatItem = fatItem
          createState.selectedFatIndex = i
          setState.blockSelected([createState.fatItem.offset])
          yield { actions, disk, fs }
          break
        }
      }

      actions.state.stepIndex = 3
      setMsg(`Allocate cluster for ${actions.file.name}`)
      yield { actions, disk, fs }

      setMsg(`Write file data into cluster ${createState.fatItem.offset}`)
      setState.fileFlash([0])
      setState.blockSelected([createState.fatItem.offset])
      yield { actions, disk, fs }

      fs.allocateFirstCluster(createState.fatItem, createState.directoryEntry)
      actions.file.currentSize--
      setState.fileFlash([])
      yield { actions, disk, fs }

      actions.state.msg = `Set fat ${createState.selectedFatIndex}'s next cluster as EOF`
      setState.fatSelected([createState.selectedFatIndex])
      createState.fatItem.setState(FatItemState.END_OF_CLUSTER, createState.directoryEntry.name, createState.directoryEntry.color)
      yield { actions, disk, fs }

      actions.state.msg = 'Update first cluster number in directory entry'
      createState.directoryEntry.firstClusterNumber = createState.selectedFatIndex
      yield { actions, disk, fs }

      actions.state.stepIndex = 4
      setState.reset()
      yield { actions, disk, fs }

      while (actions.file.currentSize > 0) {
        createState.previousFatItem = createState.fatItem
        actions.state.stepIndex = 5
        yield { actions, disk, fs }

        for (const [i, fatItem] of fs.fatTable.table.entries()) {
          setState.fatSelected([i])
          setMsg(`Check if fat ${i} is free`)
          yield { actions, disk, fs }

          if (fatItem.nextCluster === FatItemState.FREE_CLUSTER) {
            setState.fatFlash([i])
            setMsg(`Free cluster found at ${i}`)
            createState.fatItem = fatItem
            createState.selectedFatIndex = i
            setState.blockSelected([createState.fatItem.offset])
            yield { actions, disk, fs }
            break
          }
        }

        actions.state.stepIndex = 6
        setMsg(`Write file data into cluster ${createState.fatItem.offset}`)
        setState.fileFlash([0])
        setState.blockSelected([createState.fatItem.offset])
        yield { actions, disk, fs }

        setState.fileFlash([])
        fs.allocateCluster(createState.fatItem, createState.directoryEntry)
        actions.file.currentSize--
        yield { actions, disk, fs }

        setMsg(`Mark current fat ${createState.selectedFatIndex} as EOF`)
        createState.fatItem.setEndState(createState.directoryEntry.name, createState.directoryEntry.color)
        yield { actions, disk, fs }

        actions.state.stepIndex = 7
        setMsg(`Update previous fat ${createState.previousFatItem.offset}'s next cluster current FAT number(${createState.fatItem.offset})`)
        setState.fatSelected([createState.previousFatItem.offset])
        createState.previousFatItem.nextCluster = createState.fatItem.offset
        setState.reset(['block', 'fat'])
        yield { actions, disk, fs }
      }

      actions.state.msg = 'All file data has been allocated'
      actions.state.stepIndex = 7
      setState.reset()
      yield { actions, disk, fs }
    },
  }
}
