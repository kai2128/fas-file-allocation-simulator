import randomColor from 'randomcolor'
import type { Bitmap } from './bitmap'
import { ExtentTree } from './extent'
import type { Disk } from '~/libs/volume/disk'

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

  updateInode(name: string, size: number) {
    this.color = randomColor({ luminosity: 'light', seed: name })
    this.name = name
    this.size = size
    this.dateCreated = Date.now()
  }

  setSize(size: number, mode = 'append') {
    if (mode === 'append') {
      this.size = Number(this.size) + Number(size)
      this.extentTree.fileSize = Number(this.size)
      return
    }

    this.size = Number(size)
    this.extentTree.fileSize = Number(this.size)
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
    this.name = 'DELETED'
    this.color = '#fff'
    this.state = 'free'
    this.size = 0
    this.extentTree = new ExtentTree(0, [])
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
