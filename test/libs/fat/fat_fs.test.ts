import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Disk } from '~/libs/volume/disk'
import { FatFs, FatItemState } from '~/libs/fs/fat'

function setupFat() {
  const disk = new Disk(20)
  return {
    disk,
    fat: FatFs.format(disk),
  }
}

describe('FAT', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2020-01-01T00:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should format disk with 4 reserved sectors, and fat table with free cluster starting at offset 3', () => {
    const { fat } = setupFat()
    expect(fat.fatTable.table.length).toBe(16)

    // 0, 1 is reserved for flag, 2 is root directory
    expect(fat.fatTable.table[3]).toMatchObject(
      {
        nextCluster: FatItemState.FREE_CLUSTER,
        offset: 7,
      },
    )
    expect(fat.fatTable.freeClusterCount()).toBe(13)
    expect(fat.fsInfo()).toMatchInlineSnapshot(`
      {
        "freeClusterCount": 13,
        "nextFreeCluster": 3,
      }
    `)
    expect(fat.fatTable.getFatIndexesForAllocation(5)).toMatchInlineSnapshot(`
      [
        3,
        4,
        5,
        6,
        7,
      ]
    `)
    expect(fat.fatTable.freeClusterCount()).toBe(13)
  })

  it('should create root directory properly at fat index 2 and disk sector 6', () => {
    const { fat, disk } = setupFat()
    expect(fat.fatTable.table[2]).toMatchObject(
      {
        nextCluster: FatItemState.END_OF_CLUSTER,
        offset: 6,
      },
    )
    expect(disk.readUnit(fat.fatTable.table[2].offset)).toMatchInlineSnapshot(`
      {
        "offset": 6,
        "state": {
          "color": "#c8ef88",
          "data": DirectoryEntry {
            "color": "#c8ef88",
            "dateCreated": 1577836800000,
            "files": [],
            "firstClusterNumber": 2,
            "name": "root",
            "size": 1,
            "type": "directory",
          },
          "free": false,
          "reserved": false,
          "used": true,
        },
      }
    `)
  })

  it('should create and read file correctly on correct fat table', () => {
    const fileName = 'file.txt'
    const { fat } = setupFat()

    fat.createFile(fileName, 3)
    expect(fat.readFile(fileName)).toMatchInlineSnapshot(`
      {
        "data": DirectoryEntry {
          "color": "#bbbcf7",
          "dateCreated": 1577836800000,
          "firstClusterNumber": 3,
          "name": "file.txt",
          "size": 3,
          "type": "file",
        },
        "diskOffsets": [
          7,
          8,
          9,
        ],
        "fatIndexes": [
          3,
          4,
          5,
        ],
        "fatItems": [
          FatItem {
            "color": "#bbbcf7",
            "name": "file.txt",
            "nextCluster": 4,
            "offset": 7,
          },
          FatItem {
            "color": "#bbbcf7",
            "name": "file.txt",
            "nextCluster": 5,
            "offset": 8,
          },
          FatItem {
            "color": "#bbbcf7",
            "name": "file.txt",
            "nextCluster": 268435448,
            "offset": 9,
          },
        ],
      }
    `)
    expect(fat.fatTable.table.slice(3, 6)).toMatchInlineSnapshot(`
      [
        FatItem {
          "color": "#bbbcf7",
          "name": "file.txt",
          "nextCluster": 4,
          "offset": 7,
        },
        FatItem {
          "color": "#bbbcf7",
          "name": "file.txt",
          "nextCluster": 5,
          "offset": 8,
        },
        FatItem {
          "color": "#bbbcf7",
          "name": "file.txt",
          "nextCluster": 268435448,
          "offset": 9,
        },
      ]
    `)
  })

  it('should delete file correctly', () => {
    const fileName = 'file.txt'
    const { fat } = setupFat()
    fat.createFile(fileName, 3)
    fat.deleteFile(fileName)
    expect(fat.fatTable.table.slice(3, 6)).toMatchInlineSnapshot(`
      [
        FatItem {
          "color": "#ffffff",
          "name": "free",
          "nextCluster": 0,
          "offset": 7,
        },
        FatItem {
          "color": "#ffffff",
          "name": "free",
          "nextCluster": 0,
          "offset": 8,
        },
        FatItem {
          "color": "#ffffff",
          "name": "free",
          "nextCluster": 0,
          "offset": 9,
        },
      ]
    `)
  })

  it('should append file correctly', () => {
    const fileName = 'file.txt'
    const { fat } = setupFat()
    fat.createFile(fileName, 3)
    fat.appendFile(fileName, 3)
    expect(fat.fatTable.table.slice(3, 9)).toMatchInlineSnapshot(`
      [
        FatItem {
          "color": "#bbbcf7",
          "name": "file.txt",
          "nextCluster": 4,
          "offset": 7,
        },
        FatItem {
          "color": "#bbbcf7",
          "name": "file.txt",
          "nextCluster": 5,
          "offset": 8,
        },
        FatItem {
          "color": "#bbbcf7",
          "name": "file.txt",
          "nextCluster": 6,
          "offset": 9,
        },
        FatItem {
          "color": "#bbbcf7",
          "name": "file.txt",
          "nextCluster": 7,
          "offset": 10,
        },
        FatItem {
          "color": "#bbbcf7",
          "name": "file.txt",
          "nextCluster": 8,
          "offset": 11,
        },
        FatItem {
          "color": "#bbbcf7",
          "name": "file.txt",
          "nextCluster": 268435448,
          "offset": 12,
        },
      ]
    `)
  })

  it('should write file correctly', () => {
    const fileName = 'file.txt'
    const { fat } = setupFat()
    fat.createFile(fileName, 10)
    fat.fs_write(fileName, 2)
    expect(fat.fatTable.table.slice(3, 5)).toMatchInlineSnapshot(`
      [
        FatItem {
          "color": "#bbbcf7",
          "name": "file.txt",
          "nextCluster": 4,
          "offset": 7,
        },
        FatItem {
          "color": "#bbbcf7",
          "name": "file.txt",
          "nextCluster": 268435448,
          "offset": 8,
        },
      ]
    `)
  })
})
