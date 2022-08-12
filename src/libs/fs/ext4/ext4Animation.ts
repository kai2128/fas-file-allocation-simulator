import { isEmpty, last, range } from 'lodash-es'
import type { Ext4 } from './ext4'
import type { Inode } from './inode'
import type { Bitmap } from './bitmap'
import { Extent } from './extent'
import type { Disk } from '~/libs/volume'
import type { Actions } from '~/composables/actions'
import type { AnimationGenerator } from '~/composables/animations'

interface GeneratorState {
  selectedInode: Inode
  selectedBlockBitmaps: Bitmap[]
}

export function ext4Animation(fs: Ext4, disk: Disk, actions: Actions): AnimationGenerator {
  function* searchFileInRootDirectory() {
    for (const file of fs.rootDirectory.files) {
      setState.directorySelected([file.name])
      setMsg(`Compare ${file.name} with ${actions.file.name}`)
      yield { actions, disk, fs }
      if (file.name === actions.file.name) {
        setState.directoryFlash([file.name])
        setMsg(`File ${actions.file.name} found`)
        yield { actions, disk, fs }
        setState.directoryFlash([])
        break
      }
    }
  }

  function* getInodeFromDirectoryEntry(acState: GeneratorState) {
    acState.selectedInode = fs.getInodeFromDirectory(actions.file.name)
    actions.state.selectedInode = acState.selectedInode.index
    setMsg(`From directory entry, inode number for file ${actions.file.name} = ${acState.selectedInode.index} `)
    setState.inodeBitmapSelected([acState.selectedInode.index])
    yield { actions, disk, fs }
  }

  function* showAllocatedBlocks(acState: GeneratorState) {
    const allocatedBlocks = [] as number[]
    for (const [i, extent] of acState.selectedInode.extentTree.extents.entries()) {
      setState.extentSelected([i])
      setMsg(`From extent ${i + 1}, allocated blocks: ${extent.start} - ${extent.end - 1}`)
      yield { actions, disk, fs }

      allocatedBlocks.push(...range(extent.start, extent.end))
      setState.blockSelected([...allocatedBlocks])
      setMsg(`Total allocated blocks: ${allocatedBlocks}`)
      yield { actions, disk, fs }
    }
  }

  return {
    *create() {
      const createState = {} as GeneratorState

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

      actions.state.stepIndex = 1
      for (const inodeBitmap of fs.inodeBitmap) {
        setState.inodeBitmapSelected([inodeBitmap.index])
        actions.state.selectedInode = inodeBitmap.index
        setMsg(`Check if inode ${inodeBitmap.index} is free`)
        yield { actions, disk, fs }
        if (inodeBitmap.free) {
          setState.reset()
          actions.state.selectedInode = inodeBitmap.index
          setMsg(`Free inode found at inode ${inodeBitmap.index}`)
          createState.selectedInode = fs.inodeTable.getInode(inodeBitmap.index)
          setState.inodeBitmapFlash([inodeBitmap.index])
          yield { actions, disk, fs }
          break
        }
      }

      setState.reset()
      setMsg('Set file name and size to the inode')
      createState.selectedInode.updateInode(actions.file.name, actions.file.size)
      fs.updateInodeTable(createState.selectedInode)
      yield { actions, disk, fs }

      actions.state.stepIndex = 2
      createState.selectedBlockBitmaps = []
      for (const blockBitmap of fs.blockBitmap) {
        setState.blockBitmapFlash([blockBitmap.index])
        setMsg(`Check if block ${blockBitmap.index} is free`)
        yield { actions, disk, fs }
        if (blockBitmap.free) {
          createState.selectedBlockBitmaps.push(blockBitmap)
          setMsg(`Free block found at inode ${blockBitmap.index}, Total free blocks found: ${createState.selectedBlockBitmaps.length}`)
          setState.blockBitmapSelected(createState.selectedBlockBitmaps.map(v => v.index))
          yield { actions, disk, fs }
          if (createState.selectedBlockBitmaps.length >= createState.selectedInode.size) {
            setMsg(`Enough free blocks found for file size ${createState.selectedInode.size}`)
            yield { actions, disk, fs }
            setMsg(`Free blocks: ${createState.selectedBlockBitmaps.map(v => v.index)}`)
            yield { actions, disk, fs }
            break
          }
        }
      }

      actions.state.stepIndex = 3
      const contigousBlocks = [] as number[]
      for (let i = 0; i < createState.selectedBlockBitmaps.length; i++) {
        const currentBlock = createState.selectedBlockBitmaps[i].index
        const nextBlock = createState.selectedBlockBitmaps[i + 1]?.index || null
        if (nextBlock && currentBlock + 1 === nextBlock) {
          contigousBlocks.push(currentBlock)
          setState.blockBitmapFlash([...contigousBlocks])
          setMsg(`Contiguous blocks: ${contigousBlocks}`)
          yield { actions, disk, fs }
        }

        if ((nextBlock && currentBlock + 1 !== nextBlock) || (contigousBlocks.length !== 0 && i === createState.selectedBlockBitmaps.length - 1)) {
          contigousBlocks.push(currentBlock)
          setState.blockBitmapFlash([...contigousBlocks])
          setMsg(`Contiguous blocks: ${contigousBlocks}, contiguous block breaks at ${currentBlock}`)
          yield { actions, disk, fs }

          setMsg(`Create extent for these blocks, start: ${contigousBlocks[0]}, length: ${contigousBlocks.length}`)
          createState.selectedInode.extentTree.extents.push(new Extent(contigousBlocks[0], contigousBlocks.length))
          contigousBlocks.length = 0
          setState.blockBitmapFlash([])
          yield { actions, disk, fs }
        }
      }

      actions.state.stepIndex = 4
      setMsg('Update block bitmaps as used')
      setState.blockBitmapSelected(createState.selectedBlockBitmaps.map(v => v.index))
      setState.blockSelected(createState.selectedBlockBitmaps.map(v => v.index))
      actions.file.currentSize = 0
      yield { actions, disk, fs }
      fs.writeToDisk(createState.selectedInode)
      yield { actions, disk, fs }

      actions.state.stepIndex = 5
      fs.rootDirectory.addFile(createState.selectedInode)
      setState.reset()
      setMsg(`Done creating ${actions.file.name}`)
      log(`File ${actions.file.name} created with size ${actions.file.size}.`)
      yield { actions, disk, fs }
      setState.reset()
    },
    *delete() {
      const deleteState = {} as GeneratorState

      actions.state.stepIndex = 0
      yield * searchFileInRootDirectory()

      actions.state.stepIndex = 1
      yield * getInodeFromDirectoryEntry(deleteState)

      actions.state.stepIndex = 2
      yield * showAllocatedBlocks(deleteState)

      actions.state.stepIndex = 3
      setMsg('Set all allocated block free')
      setState.blockSelected(deleteState.selectedInode.allocatedBlock)
      deleteState.selectedInode.setAllocatedBlockFree(fs.blockBitmap, fs.disk)
      yield { actions, disk, fs }

      actions.state.stepIndex = 4
      setState.reset()
      setMsg('Update inode and inode bitmap')
      deleteState.selectedInode.setFree()
      fs.inodeBitmap[deleteState.selectedInode.index].setFree()
      yield { actions, disk, fs }

      setMsg('Remove file from directory')
      fs.rootDirectory.deleteFile(actions.file.name)
      log(`File ${actions.file.name} deleted.`)
      yield { actions, disk, fs }
    },
    *append() {
      const appendState = {} as GeneratorState
      actions.state.stepIndex = 0
      yield * searchFileInRootDirectory()

      actions.state.stepIndex = 1
      yield * getInodeFromDirectoryEntry(appendState)

      actions.state.stepIndex = 2
      yield * showAllocatedBlocks(appendState)

      actions.state.stepIndex = 3
      const lastBlock = last(appendState.selectedInode.allocatedBlock)!
      setState.blockSelected([lastBlock])
      yield { actions, disk, fs }

      actions.state.stepIndex = 4
      appendState.selectedBlockBitmaps = []
      const contiguousBlocks = [] as number[]
      let sizeToBeAllocated = actions.file.size
      for (let i = lastBlock; i < fs.blockBitmap.length; i++) {
        if (sizeToBeAllocated <= 0) {
          setMsg(`Enough free blocks found, Total: ${appendState.selectedBlockBitmaps.length} blocks`)
          yield { actions, disk, fs }
          break
        }

        const currentBlock = fs.blockBitmap[i]
        const nextBlock = fs.blockBitmap[i + 1] || null
        setState.blockBitmapFlash([currentBlock.index])
        setMsg(`Check if block ${i} is free`)
        yield { actions, disk, fs }

        if (currentBlock.used) {
          setMsg(`Block ${i} is used. Go to next block`)
          continue
        }

        if (currentBlock.free && nextBlock?.free) {
          appendState.selectedBlockBitmaps.push(currentBlock)
          contiguousBlocks.push(currentBlock.index)
          setState.blockBitmapSelected(appendState.selectedBlockBitmaps.map(v => v.index))
          sizeToBeAllocated--
          setMsg(`Contiguous free block found at block ${currentBlock.index}`)
          yield { actions, disk, fs }
        }
        else {
          appendState.selectedBlockBitmaps.push(currentBlock)
          contiguousBlocks.push(currentBlock.index)
          setState.blockBitmapSelected(appendState.selectedBlockBitmaps.map(v => v.index))
          sizeToBeAllocated--

          setMsg(`Contiguous blocks break at block ${currentBlock.index}`)
          yield { actions, disk, fs }

          setMsg(`Create extent for these blocks, start: ${contiguousBlocks[0]}, length: ${contiguousBlocks.length}`)
          setState.blockBitmapFlash([...contiguousBlocks])
          appendState.selectedInode.extentTree.extents.push(new Extent(contiguousBlocks[0], contiguousBlocks.length))
          contiguousBlocks.length = 0
          yield { actions, disk, fs }
        }

        if (sizeToBeAllocated > 0 && i === fs.blockBitmap.length - 1) {
          setMsg('Start searching for free blocks from begining.')
          yield { actions, disk, fs }
        }
      }

      if (contiguousBlocks.length > 0) {
        setMsg(`Create extent for these blocks, start: ${contiguousBlocks[0]}, length: ${contiguousBlocks.length}`)
        appendState.selectedInode.extentTree.extents.push(new Extent(contiguousBlocks[0], contiguousBlocks.length))
        contiguousBlocks.length = 0
        setState.blockBitmapFlash([])
        yield { actions, disk, fs }
      }

      actions.state.stepIndex = 5
      setState.reset()
      appendState.selectedInode.extentTree.mergeExtents()
      yield { actions, disk, fs }

      actions.state.stepIndex = 6
      setMsg('Update block bitmaps as used')
      setState.blockBitmapSelected(appendState.selectedBlockBitmaps.map(v => v.index))
      setState.blockSelected(appendState.selectedBlockBitmaps.map(v => v.index))
      appendState.selectedInode.size = Number(appendState.selectedInode.size) + Number(actions.file.size)
      actions.file.currentSize = 0
      yield { actions, disk, fs }
      fs.writeToDisk(appendState.selectedInode)
      setMsg('File appended')

      log(`File ${actions.file.name} appended with size ${actions.file.size}.`)
      yield { actions, disk, fs }
    },
    *read() {
      const readState = {} as GeneratorState
      actions.state.stepIndex = 0
      yield * searchFileInRootDirectory()

      actions.state.stepIndex = 1
      yield * getInodeFromDirectoryEntry(readState)

      actions.state.stepIndex = 2
      yield * showAllocatedBlocks(readState)
      actions.file.currentSize = readState.selectedInode.size

      log(`File ${actions.file.name} read.`)
      setState.reset()
    },
    *write() {
      const writeState = {} as GeneratorState
      actions.state.stepIndex = 0
      yield * searchFileInRootDirectory()

      actions.state.stepIndex = 1
      yield * getInodeFromDirectoryEntry(writeState)

      actions.state.stepIndex = 2
      yield * showAllocatedBlocks(writeState)
      const firstAllocatedBlock = writeState.selectedInode.allocatedBlock[0]
      writeState.selectedInode.setAllocatedBlockFree(fs.blockBitmap, fs.disk)
      yield { actions, disk, fs }

      actions.state.stepIndex = 3
      setState.blockSelected([firstAllocatedBlock])
      yield { actions, disk, fs }

      actions.state.stepIndex = 4
      writeState.selectedBlockBitmaps = []
      writeState.selectedInode.extentTree.extents = []
      const contiguousBlocks = [] as number[]
      let sizeToBeAllocated = actions.file.size
      for (let i = firstAllocatedBlock; i < fs.blockBitmap.length; i++) {
        if (sizeToBeAllocated <= 0) {
          setMsg(`Enough free blocks found, Total: ${writeState.selectedBlockBitmaps.length} blocks`)
          yield { actions, disk, fs }
          break
        }

        const currentBlock = fs.blockBitmap[i]
        const nextBlock = fs.blockBitmap[i + 1] || null
        setState.blockBitmapFlash([currentBlock.index])
        setMsg(`Check if block ${i} is free`)
        yield { actions, disk, fs }

        if (currentBlock.used) {
          setMsg(`Block ${i} is used. Go to next block`)
          continue
        }

        if (currentBlock.free && nextBlock?.free) {
          writeState.selectedBlockBitmaps.push(currentBlock)
          contiguousBlocks.push(currentBlock.index)
          setState.blockBitmapSelected(writeState.selectedBlockBitmaps.map(v => v.index))
          sizeToBeAllocated--
          setMsg(`Contiguous free block found at block ${currentBlock.index}`)
          yield { actions, disk, fs }
        }
        else {
          writeState.selectedBlockBitmaps.push(currentBlock)
          contiguousBlocks.push(currentBlock.index)
          setState.blockBitmapSelected(writeState.selectedBlockBitmaps.map(v => v.index))
          sizeToBeAllocated--

          setMsg(`Contiguous blocks break at block ${currentBlock.index}`)
          yield { actions, disk, fs }

          setMsg(`Create extent for these blocks, start: ${contiguousBlocks[0]}, length: ${contiguousBlocks.length}`)
          setState.blockBitmapFlash([...contiguousBlocks])
          writeState.selectedInode.extentTree.extents.push(new Extent(contiguousBlocks[0], contiguousBlocks.length))
          contiguousBlocks.length = 0
          yield { actions, disk, fs }
        }

        if (sizeToBeAllocated > 0 && i === fs.blockBitmap.length - 1) {
          setMsg('Start searching for free blocks from begining.')
          yield { actions, disk, fs }
        }
      }

      if (contiguousBlocks.length > 0) {
        setMsg(`Create extent for these blocks, start: ${contiguousBlocks[0]}, length: ${contiguousBlocks.length}`)
        writeState.selectedInode.extentTree.extents.push(new Extent(contiguousBlocks[0], contiguousBlocks.length))
        contiguousBlocks.length = 0
        setState.blockBitmapFlash([])
        yield { actions, disk, fs }
      }

      actions.state.stepIndex = 5
      setState.reset()
      writeState.selectedInode.extentTree.mergeExtents()
      yield { actions, disk, fs }

      actions.state.stepIndex = 6
      setMsg('Update block bitmaps as used')
      setState.blockBitmapSelected(writeState.selectedBlockBitmaps.map(v => v.index))
      setState.blockSelected(writeState.selectedBlockBitmaps.map(v => v.index))
      writeState.selectedInode.size = actions.file.size
      actions.file.currentSize = 0
      yield { actions, disk, fs }
      fs.writeToDisk(writeState.selectedInode)
      setMsg('File written')
      log(`File ${actions.file.name} written with size ${actions.file.size}.`)
      yield { actions, disk, fs }
      setState.reset()
    },
  }
}
