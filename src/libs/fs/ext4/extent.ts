import { flattenDeep, range } from 'lodash-es'
import type { Bitmap } from './bitmap'

export class ExtentTree {
  extents: Extent[] = []
  fileSize: number
  blocksBitmap: Bitmap[]

  constructor(size: number, blocksBitmap: Bitmap[]) {
    this.fileSize = size
    this.blocksBitmap = blocksBitmap
    this.allocateFreeBlockToExtent()
  }

  getAllocatedBlocks() {
    return flattenDeep(this.extents.map(extent => range(extent.start, extent.end)))
  }

  allocateFreeBlockToExtent(startingBlock = 0) {
    this.extents = []
    const continguousFreeBlocks: number[] = []
    let allocatedSize = this.fileSize
    for (let i = startingBlock; i < this.blocksBitmap.length; i++) {
      if (allocatedSize <= 0)
        break

      if (this.blocksBitmap[i].used)
        continue

      if (this.blocksBitmap[i].free && this.blocksBitmap[i + 1]?.free) {
        continguousFreeBlocks.push(i)
        allocatedSize--
      }
      else {
        continguousFreeBlocks.push(i)
        allocatedSize--
        this.extents.push(new Extent(continguousFreeBlocks[0], continguousFreeBlocks.length))
        continguousFreeBlocks.length = 0
      }

      // if until last block still not yet finish allocation start search for free block in head
      if (allocatedSize > 0 && i === this.blocksBitmap.length - 1)
        i = 0
    }
    if (continguousFreeBlocks.length > 0)
      this.extents.push(new Extent(continguousFreeBlocks[0], continguousFreeBlocks.length))
  }
}

export class Extent {
  get end() {
    return this.start + this.length
  }

  constructor(
    public start: number,
    public length: number,
  ) {
  }
}

// export class Extent {
//   start_hi?: number
//   start_lo?: number
//   constructor(
//     public ee_block: number,
//     public ee_len: number,
//   ) {
//   }
// }

// export class ExtentIdx {
//   ei_unused?: number
//   ei_leaf_hi?: number
//   ei_leaf_lo?: number
//   constructor(
//     public ei_block: number,
//     public ei_len: number,
//   ) {
//   }
// }

// export class ExtentHeader {
//   eh_magic?: number
//   constructor(
//     public eh_entries: number,
//     public eh_max: number,
//     public eh_depth: number,
//     public eh_generation: number,
//   ) {
//   }
// }
