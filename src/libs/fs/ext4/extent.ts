import { flattenDeep, last, range } from 'lodash-es'
import type { Bitmap } from './bitmap'

export class ExtentTree {
  extents: Extent[] = []
  fileSize: number

  constructor(size: number, blocksBitmap: Bitmap[]) {
    this.fileSize = size
    this.allocateFreeBlockToExtent(blocksBitmap)
  }

  getAllocatedBlocks() {
    return flattenDeep(this.extents.map(extent => range(extent.start, extent.end)))
  }

  appendBlockToExtent(appendSize: number, blocksBitmap: Bitmap[]) {
    const lastBlock = last(this.getAllocatedBlocks())!
    let sizeToBeAllocate = appendSize
    const continguousFreeBlocks: number[] = []
    for (let i = lastBlock; i < blocksBitmap.length; i++) {
      if (sizeToBeAllocate <= 0)
        break

      if (blocksBitmap[i].used)
        continue

      if (blocksBitmap[i].free && blocksBitmap[i + 1]?.free) {
        continguousFreeBlocks.push(i)
        sizeToBeAllocate--
      }
      else {
        continguousFreeBlocks.push(i)
        sizeToBeAllocate--
        this.extents.push(new Extent(continguousFreeBlocks[0], continguousFreeBlocks.length))
        continguousFreeBlocks.length = 0
      }

      // if until last block still not yet finish allocation start search for free block in head
      if (sizeToBeAllocate > 0 && i === blocksBitmap.length - 1)
        i = 0
    }
    if (continguousFreeBlocks.length > 0)
      this.extents.push(new Extent(continguousFreeBlocks[0], continguousFreeBlocks.length))

    // check if extent is contiguous
    // TODO: merge contiguous extent
    // const newExtents = []
    // for (let i = 0; i < this.extents.length; i++) {
    //   const extent = this.extents[i]
    //   const nextExtent = this.extents[i + 1]
    //   if (extent.end == nextExtent.start){
    //     newExtents.push(new Extent(extent.start, extent.length + this.extents[i + 1].length))
    //     i++
    //   }
    //   }

    // }
  }

  // mergeExtents(extent: Extent){

  // }

  allocateFreeBlockToExtent(blocksBitmap: Bitmap[], startingBlock = 0) {
    this.extents = []
    const continguousFreeBlocks: number[] = []
    let sizeToBeAllocated = this.fileSize
    for (let i = startingBlock; i < blocksBitmap.length; i++) {
      if (sizeToBeAllocated <= 0)
        break

      if (blocksBitmap[i].used)
        continue

      if (blocksBitmap[i].free && blocksBitmap[i + 1]?.free) {
        continguousFreeBlocks.push(i)
        sizeToBeAllocated--
      }
      else {
        continguousFreeBlocks.push(i)
        sizeToBeAllocated--
        this.extents.push(new Extent(continguousFreeBlocks[0], continguousFreeBlocks.length))
        continguousFreeBlocks.length = 0
      }

      // if until last block still not yet finish allocation start search for free block in head
      if (sizeToBeAllocated > 0 && i === blocksBitmap.length - 1)
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
