import { isEmpty } from 'lodash-es'
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
      createState.selectedInode.name = actions.file.name
      createState.selectedInode.size = actions.file.size
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
      yield { actions, disk, fs }
      fs.writeToDisk(createState.selectedInode)
      yield { actions, disk, fs }

      actions.state.stepIndex = 5
      fs.rootDirectory.addFile(createState.selectedInode)
      setState.reset()
      setMsg(`Done creating ${actions.file.name}`)
      log(`File ${actions.file.name} created with size ${actions.file.size}.`)
      yield { actions, disk, fs }
    },
    *delete() {
      

    },
    *append() {

    },
    *read() {

    },
    *write() {

    },
  }
}
