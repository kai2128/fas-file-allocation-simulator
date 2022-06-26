import { isEmpty, remove } from 'lodash-es'
import { setState } from './../../../composables/actions'
import { DirectoryEntry } from './directoryEntry'
import { fatActions } from './fatAction'
import type { FatFs } from './fatfs'
import type { FatItem } from './fatItem'
import type { Disk } from '~/libs/volume'
import { BlockColor } from '~/libs/volume'
import { setMsg, setStepsDesc } from '~/composables/actions'
import type { Actions } from '~/composables/actions'

import { FatItemState } from '~/libs/fs/fat'

interface FatAnimationState {
  firstFreeCluster: FatItem
  directoryEntry: DirectoryEntry
  selectedFatIndex: number
  fatItem: FatItem
  previousFatItem: FatItem
  selectedFatItemsIndex: number[]
}

export function fatAnimation(fs: FatFs, disk: Disk, actions: Actions) {
  function* searchFileInDirectory(aniState: FatAnimationState) {
    if (isEmpty(fs.rootDirectory.files)) {
      setMsg('Directory has no files, file not found')
      return
    }
    setMsg(`Search for file ${actions.file.name} in directory`)
    for (const file of fs.rootDirectory.files) {
      setState.directorySelected([file.name])
      setMsg(`Compare ${file.name} with ${actions.file.name}`)
      yield { actions, disk, fs }
      if (file.name === actions.file.name) {
        setState.directoryFlash([file.name])
        aniState.directoryEntry = file
        setMsg(`File ${actions.file.name} found`)
        yield { actions, disk, fs }
        break
      }
    }
    setState.reset()
  }
  function* getFirstFatItemAfterSearchingInDirectory(aniState: FatAnimationState) {
    setMsg(`From directory entry, first cluster number: ${aniState.directoryEntry.firstClusterNumber}`)
    aniState.fatItem = fs.fatTable.getFatItem(aniState.directoryEntry.firstClusterNumber!)
    yield { actions, disk, fs }
  }

  function* searchForFreeCluster(aniState: Omit<FatAnimationState, 'selectedFatItems'>) {
    for (const [i, fatItem] of fs.fatTable.table.entries()) {
      setState.fatSelected([i])
      setMsg(`Check if fat ${i} is free`)
      yield { actions, disk, fs }

      if (fatItem.nextCluster === FatItemState.FREE_CLUSTER) {
        setState.fatFlash([i])
        setMsg(`Free cluster found at ${i}`)
        aniState.fatItem = fatItem
        aniState.selectedFatIndex = i
        setState.blockSelected([aniState.fatItem.offset])
        yield { actions, disk, fs }
        break
      }
    }
  }

  function* allocateClusterAfterFoundFreeCluster(aniState: Omit<FatAnimationState, 'selectedFatItems'>) {
    setMsg(`Allocate cluster for ${actions.file.name}`)
    yield { actions, disk, fs }

    setMsg(`Write file data into cluster ${aniState.fatItem.offset}`)
    setState.fileFlash([0])
    setState.blockSelected([aniState.fatItem.offset])
    yield { actions, disk, fs }

    fs.allocateFirstCluster(aniState.fatItem, aniState.directoryEntry)
    actions.file.currentSize--
    setState.fileFlash([])
    yield { actions, disk, fs }

    actions.state.msg = `Set fat ${aniState.selectedFatIndex}'s next cluster as EOF`
    setState.fatSelected([aniState.selectedFatIndex])
    aniState.fatItem.setState(FatItemState.END_OF_CLUSTER, aniState.directoryEntry.name, aniState.directoryEntry.color)
    yield { actions, disk, fs }
  }

  function * updatePreviousFat(aniState: Omit<FatAnimationState, 'selectedFatItems'>) {
    setMsg(`Update previous fat ${aniState.previousFatItem.index}'s next cluster current FAT number(${aniState.fatItem.offset})`)
    setState.fatSelected([aniState.previousFatItem.index])
    aniState.previousFatItem.nextCluster = aniState.fatItem.index
    yield { actions, disk, fs }
    setState.reset(['block', 'fat'])
  }

  return {
    *create() {
      fs.checkUniqueFileName(actions.file.name)
      const createState = {} as Omit<FatAnimationState, 'selectedFatItems'>

      // scan root dir for repeated file name
      actions.state.stepIndex = 0
      yield { actions, disk, fs }
      if (isEmpty(fs.rootDirectory.files)) {
        setMsg('Directory has no files')
        yield { actions, disk, fs }
      }
      for (const file of fs.rootDirectory.files) {
        setState.directorySelected([file.name])
        setMsg(`Compare ${file.name} with ${actions.file.name}`)
        yield { actions, disk, fs }
        if (file.name === actions.file.name) {
          setState.reset()
          setMsg(`File ${actions.file.name} already exists`, 'error')
          return
        }
      }
      setState.reset()

      // init directory entry in root
      actions.state.stepIndex = 1
      setMsg(`Create new directory entry for ${actions.file.name}`)
      createState.directoryEntry = new DirectoryEntry(actions.file.name, actions.file.size)
      fs.rootDirectory.files.push(createState.directoryEntry)
      yield { actions, disk, fs }

      actions.state.stepIndex = 2
      yield * searchForFreeCluster(createState)

      actions.state.stepIndex = 3
      yield * allocateClusterAfterFoundFreeCluster(createState)

      actions.state.msg = 'Update first cluster number in directory entry'
      createState.directoryEntry.firstClusterNumber = createState.selectedFatIndex
      yield { actions, disk, fs }

      actions.state.stepIndex = 4
      setState.reset()
      yield { actions, disk, fs }

      while (actions.file.currentSize > 0) {
        createState.previousFatItem = createState.fatItem
        actions.state.stepIndex = 5
        yield * searchForFreeCluster(createState)

        actions.state.stepIndex = 6
        yield * allocateClusterAfterFoundFreeCluster(createState)

        actions.state.stepIndex = 7
        yield * updatePreviousFat(createState)
      }

      actions.state.msg = 'All file data has been allocated'
      actions.state.stepIndex = 7
      setState.reset()
      log(`File ${actions.file.name} created with size ${actions.file.size}.`)
      yield { actions, disk, fs }
    },
    *delete() {
      fs.checkExist(actions.file.name)
      const deleteState = {
        selectedFatItemsIndex: [] as number[],
      } as FatAnimationState

      // scan root dir for repeated file name
      actions.state.stepIndex = 0
      yield * searchFileInDirectory(deleteState)

      actions.state.stepIndex = 1
      yield * getFirstFatItemAfterSearchingInDirectory(deleteState)

      actions.state.stepIndex = 2
      while (true) {
        setMsg(`From cluster ${deleteState.fatItem.index}, next cluster: ${deleteState.fatItem.nextCluster}`)
        setState.fatFlash([deleteState.fatItem.index])
        const nextFat = fs.fatTable.getFatItem(deleteState.fatItem.nextCluster!)
        deleteState.selectedFatItemsIndex.push(deleteState.fatItem.index)
        setState.fatSelected(deleteState.selectedFatItemsIndex)
        deleteState.fatItem = nextFat
        yield { actions, disk, fs }

        if (nextFat.nextCluster === FatItemState.END_OF_CLUSTER) {
          setMsg(`Reach end of cluster at ${deleteState.fatItem.offset}`)
          setState.fatFlash([deleteState.fatItem.index])
          deleteState.selectedFatItemsIndex.push(deleteState.fatItem.index)
          setState.fatSelected(deleteState.selectedFatItemsIndex)
          yield { actions, disk, fs }
          break
        }
      }

      actions.state.stepIndex = 3
      setMsg('Mark these as free cluster')
      setState.reset()
      setState.fatFlash(deleteState.selectedFatItemsIndex)
      yield { actions, disk, fs }
      for (const fat of deleteState.selectedFatItemsIndex) {
        const fatItem = fs.fatTable.getFatItem(fat)
        fatItem.setFreeState()
        disk.setFree(fatItem.offset)
      }
      setState.reset()
      yield { actions, disk, fs }

      actions.state.stepIndex = 4
      setMsg(`Delete directory entry ${deleteState.directoryEntry.name}`)
      setState.directoryFlash([deleteState.directoryEntry.name])
      fs.rootDirectory.deleteDirEntry(deleteState.directoryEntry)
      yield { actions, disk, fs }

      setMsg(`File ${deleteState.directoryEntry.name} deleted`, 'done')
      yield { actions, disk, fs }
    },
    *read() {
      fs.checkExist(actions.file.name)
      const readState = {
      } as FatAnimationState

      // scan root dir for repeated file name
      actions.state.stepIndex = 0
      yield * searchFileInDirectory(readState)

      actions.state.stepIndex = 1
      yield * getFirstFatItemAfterSearchingInDirectory(readState)

      actions.state.stepIndex = 2
      const selectedFatItemsIndex = [] as number[]
      const selectedBlockIndex = [] as number[]
      setState.fatSelected(selectedFatItemsIndex)
      setState.blockSelected(selectedBlockIndex)
      while (true) {
        setMsg(`From fat ${readState.fatItem.index} read data from cluster ${readState.fatItem.offset}`)
        selectedFatItemsIndex.push(readState.fatItem.index)
        yield { actions, disk, fs }
        setState.blockFlash([readState.fatItem.offset])
        yield { actions, disk, fs }

        selectedBlockIndex.push(readState.fatItem.offset)
        actions.file.currentSize++
        yield { actions, disk, fs }

        setMsg(`From fat ${readState.fatItem.index} locate next fat item`)
        const nextFat = fs.fatTable.getFatItem(readState.fatItem.nextCluster!) // next fat might be null
        setState.fatFlash([nextFat?.index])
        yield { actions, disk, fs }

        setMsg(`From fat ${readState.fatItem.index}, next fat: ${readState.fatItem.nextCluster}`)
        selectedFatItemsIndex.push(readState.fatItem.index)
        readState.fatItem = nextFat
        yield { actions, disk, fs }

        if (readState.fatItem === null || readState.fatItem === undefined || readState.fatItem?.nextCluster === FatItemState.END_OF_CLUSTER) {
          if (readState.fatItem === undefined) {
            // for file only have 1 size
            setMsg(`Reach end of file at fat ${readState.directoryEntry.firstClusterNumber}`)
            yield { actions, disk, fs }
            break
          }

          setMsg(`Reach end of file at fat ${readState.fatItem?.index}`)
          selectedFatItemsIndex.push(readState.fatItem?.index)
          yield { actions, disk, fs }

          setMsg(`From fat ${readState.fatItem.index} read data from last cluster ${readState.fatItem.offset}`)
          selectedFatItemsIndex.push(readState.fatItem?.index)
          yield { actions, disk, fs }
          setState.blockFlash([readState.fatItem?.offset])
          yield { actions, disk, fs }

          selectedBlockIndex.push(readState.fatItem?.offset)
          actions.file.currentSize++
          yield { actions, disk, fs }
          break
        }
      }

      // to set all fat and block become selected
      setState.reset()
      setState.fatSelected(selectedFatItemsIndex)
      setState.blockSelected(selectedBlockIndex)
      actions.state.stepIndex = 3
      setMsg(`All data has been readed for ${readState.directoryEntry.name}`)
      yield { actions, disk, fs }
    },
    *append() {
      fs.checkExist(actions.file.name)
      const appendState = {} as FatAnimationState
      setStepsDesc(fatActions.append.steps)

      // scan root dir for repeated file name
      actions.state.stepIndex = 0
      yield * searchFileInDirectory(appendState)

      actions.state.stepIndex = 1
      yield * getFirstFatItemAfterSearchingInDirectory(appendState)

      while (true) {
        setMsg(`From fat ${appendState.fatItem.index} locate next fat item`)
        setState.fatSelected([appendState.fatItem.index])
        yield { actions, disk, fs }

        setMsg(`From fat ${appendState.fatItem.index}, next fat: ${appendState.fatItem.nextCluster}`)
        setState.fatSelected([appendState.fatItem.index])
        yield { actions, disk, fs }

        appendState.fatItem = fs.fatTable.getFatItem(appendState.fatItem.nextCluster!) // next fat might be null

        if (appendState.fatItem === undefined || appendState.fatItem.nextCluster === FatItemState.END_OF_CLUSTER) {
          setMsg(`Reach end of file at fat ${appendState.fatItem.index}`)
          setState.fatSelected([appendState.fatItem.index])
          yield { actions, disk, fs }
          break
        }
      }

      actions.state.stepIndex = 2
      appendState.previousFatItem = appendState.fatItem
      yield * searchForFreeCluster(appendState)
      yield * allocateClusterAfterFoundFreeCluster(appendState)
      yield * updatePreviousFat(appendState)

      actions.state.stepIndex = 3
      while (actions.file.currentSize > 0) {
        appendState.previousFatItem = appendState.fatItem
        actions.state.stepIndex = 4
        yield * searchForFreeCluster(appendState)

        actions.state.stepIndex = 5
        yield * allocateClusterAfterFoundFreeCluster(appendState)

        actions.state.stepIndex = 6
        yield * updatePreviousFat(appendState)
      }

      actions.state.stepIndex = 7
      setMsg(`Size ${actions.file.size} has been appended for ${appendState.directoryEntry.name}`)
      yield { actions, disk, fs }
    },
    *write() {
      fs.checkExist(actions.file.name)
      // size check
      if (actions.file.size > fs.searchFileInDirectory(actions.file.name)!.size) { // only check disk space if new size is larger than old size{
        fs.checkSpace(actions.file.size - fs.searchFileInDirectory(actions.file.name)!.size)
      }

      setMsg('For writing file is just delete and create new file')
      yield { actions, disk, fs }
      yield { actions, disk, fs }
      yield * this.delete()
      yield * this.create()
      setMsg('File write completed', 'done')
    },
  }
}
