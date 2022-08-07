import randomColor from 'randomcolor'
import { Disk } from '~/libs/volume/disk'
import type { Bitmap } from './bitmap'
import { ExtentTree } from './extent'

export class Inode {
  public color: string
  public dateCreated: number | Date
  extentTree: ExtentTree
  state: 'free' | 'used' = 'free'

  constructor(
    public index: number,
    public name: string,
    public size: number,
    blockBitmap: Bitmap[],
    public type: 'file' | 'directory' = 'file',
  ) {
    this.color = randomColor({ luminosity: 'light', seed: name })
    this.dateCreated = Date.now()
    this.extentTree = new ExtentTree(size, blockBitmap)
    this.state = 'used'
  }

  setSize(size: number, mode = 'append') {
    if (mode === 'append') {
      this.size += size
      this.extentTree.fileSize = this.size
      return
    }

    this.size = size
    this.extentTree.fileSize = this.size
  }

  setAllocatedBlockFree(bitmap: Bitmap[], disk: Disk) {
    this.allocatedBlock.forEach((block) => {
      bitmap[block].setFree()
      disk.setFree(block)
    })
  }

  get allocatedBlock() {
    return this.extentTree.getAllocatedBlocks()
  }

  get entry() {
    return {
      inode: this.index,
      name: this.name,
      size: this.size,
      type: this.type,
      dateCreated: this.dateCreated,
      color: this.color,
    }
  }

  setFree() {
    this.state = 'free'
  }

  // deleteDirEntry(file: string | Inode) {
  //   if (this.type === 'directory') {
  //     if (file instanceof Inode)
  //       remove(this.files, file)
  //     else
  //       remove(this.files, { name: file })
  //   }
  // }
}
