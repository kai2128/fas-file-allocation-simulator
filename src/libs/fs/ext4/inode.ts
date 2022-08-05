import randomColor from 'randomcolor'
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
