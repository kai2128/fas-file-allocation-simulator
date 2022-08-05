import { describe, expect, test } from 'vitest'
import { Bitmap, ExtentTree } from './../../../src/libs/fs/ext4'

function extentSetup(fileSize = 5, allocatedBlock: number[] = []): ExtentTree {
  const blocksBitmap = new Array(10).fill({}).map((v, i) => {
    return new Bitmap(i)
  })
  allocatedBlock.forEach((block) => {
    blocksBitmap[block].setUsed()
  })
  return new ExtentTree(fileSize, blocksBitmap)
}

describe.only('extents test', () => {
  test('full continuous block extents', () => {
    const extent = extentSetup()
    expect(extent.extents).toMatchInlineSnapshot(`
      [
        Extent {
          "length": 5,
          "start": 0,
        },
      ]
    `)
    expect(extent.getAllocatedBlocks()).toMatchInlineSnapshot(`
      [
        0,
        1,
        2,
        3,
        4,
      ]
    `)
  })
  test('full continuous block extents but first block is allocated', () => {
    const extent = extentSetup(5, [0])
    expect(extent.extents).toMatchInlineSnapshot(`
      [
        Extent {
          "length": 5,
          "start": 1,
        },
      ]
    `)
    expect(extent.getAllocatedBlocks()).toMatchInlineSnapshot(`
      [
        1,
        2,
        3,
        4,
        5,
      ]
    `)
  })
  test('allocation on block that allocated uneven', () => {
    const extent = extentSetup(5, [0, 3, 4, 6])
    expect(extent.extents).toMatchInlineSnapshot(`
      [
        Extent {
          "length": 2,
          "start": 1,
        },
        Extent {
          "length": 1,
          "start": 5,
        },
        Extent {
          "length": 2,
          "start": 7,
        },
      ]
    `)
    expect(extent.getAllocatedBlocks()).toMatchInlineSnapshot(`
      [
        1,
        2,
        5,
        7,
        8,
      ]
    `)
  })
  test('allocate on middle', () => {
    const extent = extentSetup(5, [0, 3, 4, 6, 8])
    extent.allocateFreeBlockToExtent(5)
    expect(extent.extents).toMatchInlineSnapshot(`
      [
        Extent {
          "length": 1,
          "start": 5,
        },
        Extent {
          "length": 1,
          "start": 7,
        },
        Extent {
          "length": 1,
          "start": 9,
        },
        Extent {
          "length": 2,
          "start": 1,
        },
      ]
    `)
    expect(extent.getAllocatedBlocks()).toMatchInlineSnapshot(`
      [
        5,
        7,
        9,
        1,
        2,
      ]
    `)
  })
})
