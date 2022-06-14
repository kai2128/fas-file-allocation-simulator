import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FatFs, FatItemState } from '~/libs/fs/fat'
import { Disk } from '~/libs/volume/disk'

function setupFat() {
  const disk = new Disk(20)
  return {
    disk,
    fat: new FatFs(disk),
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
    expect(fat.fatTable.length).toBe(16)

    // 0, 1 is reserved for flag, 2 is root directory
    expect(fat.fatTable[3]).toMatchObject(
      {
        nextCluster: FatItemState.FREE_CLUSTER,
        offset: 7,
      },
    )
    expect(fat.freeClusterCount()).toBe(13)
    expect(fat.fsInfo()).toMatchInlineSnapshot(`
      {
        "freeClusterCount": 13,
        "nextFreeCluster": 3,
      }
    `)
    expect(fat.getClustersForAllocation(5)).toMatchInlineSnapshot(`
      [
        3,
        4,
        5,
        6,
        7,
      ]
    `)
    expect(fat.freeClusterCount()).toBe(13)
  })

  it('should create root directory properly at fat index 2 and disk sector 6', () => {
    const { fat, disk } = setupFat()
    expect(fat.fatTable[2]).toMatchObject(
      {
        nextCluster: FatItemState.END_OF_CLUSTER,
        offset: 6,
      },
    )
    expect(disk.readUnit(fat.fatTable[2].offset)).toMatchObject(
      {
        offset: 6,
        state: {
          data: {
            entry: {
              firstClusterNumber: 2,
              name: 'root',
              size: 1,
              type: 'directory',
            },
            path: '/root',
          },
          free: false,
          reserved: false,
          used: true,
        },
      },
    )
  })

  it('should create and read file correctly on correct fat table', () => {
    const path = '/root/file.txt'
    const { fat } = setupFat()

    fat.createFile(path, 3)
    expect(fat.readFile('/root/file.txt')).toMatchInlineSnapshot(`
      {
        "color": "#8bf4ca",
        "dateCreated": 1577836800000,
        "diskOffsets": [
          7,
          8,
          9,
        ],
        "firstClusterNumber": 3,
        "name": "file.txt",
        "size": 3,
        "type": "file",
      }
    `)
    expect(fat.fatTable.slice(3, 6)).toMatchInlineSnapshot(`
      [
        {
          "nextCluster": 4,
          "offset": 7,
        },
        {
          "nextCluster": 5,
          "offset": 8,
        },
        {
          "nextCluster": 268435448,
          "offset": 9,
        },
      ]
    `)
  })

  it('should delete file correctly', () => {
    const path = '/root/file.txt'
    const { fat } = setupFat()
    fat.createFile(path, 3)
    fat.delete(path)
    expect(fat.fatTable.slice(3, 6)).toMatchInlineSnapshot(`
      [
        {
          "nextCluster": 0,
          "offset": 7,
        },
        {
          "nextCluster": 0,
          "offset": 8,
        },
        {
          "nextCluster": 0,
          "offset": 9,
        },
      ]
    `)
  })

  describe('Directory test', () => {
    const path = '/root/testDir'

    it('should create directory correctly', () => {
      const { fat } = setupFat()
      fat.createDirectory(path)
      expect(fat.disk.readUnit(7)).toMatchInlineSnapshot(`
        {
          "offset": 7,
          "state": {
            "color": "#aef78f",
            "data": {
              "childs": [],
              "entry": {
                "dateCreated": 1577836800000,
                "firstClusterNumber": 3,
                "name": "testDir",
                "size": 1,
                "type": "directory",
              },
              "path": "/root/testDir",
            },
            "free": false,
            "reserved": false,
            "used": true,
          },
        }
      `)
      expect(fat.fatTable[3]).toMatchInlineSnapshot(`
      {
        "nextCluster": 268435448,
        "offset": 7,
      }
    `)
    })

    it('should delete directory correctly', () => {
      const { fat } = setupFat()
      fat.createDirectory(path)
      fat.delete(path)
      expect(fat.disk.readUnit(7)).toMatchInlineSnapshot(`
        {
          "offset": 7,
          "state": {
            "color": "#ffffff",
            "data": {},
            "free": true,
            "reserved": false,
            "used": false,
          },
        }
      `)
      expect(fat.fatTable[3]).toMatchInlineSnapshot(`
      {
        "nextCluster": 0,
        "offset": 7,
      }
    `)
    })
  })

  it('should create file and directory correctly', () => {
    const dirPath = '/root/testDir'
    const { fat } = setupFat()
    fat.createDirectory(dirPath)
    fat.createFile(`${dirPath}/test.txt`, 3)
    expect(fat.fatTable[3]).toMatchInlineSnapshot(`
      {
        "nextCluster": 268435448,
        "offset": 7,
      }
    `)
    expect(fat.fatTable.slice(4, 7)).toMatchInlineSnapshot(`
      [
        {
          "nextCluster": 5,
          "offset": 8,
        },
        {
          "nextCluster": 6,
          "offset": 9,
        },
        {
          "nextCluster": 268435448,
          "offset": 10,
        },
      ]
    `)

    fat.delete(dirPath)
    expect(fat.fatTable[3]).toMatchInlineSnapshot(`
      {
        "nextCluster": 268435448,
        "offset": 7,
      }
    `)
    expect(fat.fatTable.slice(4, 7)).toMatchInlineSnapshot(`
      [
        {
          "nextCluster": 0,
          "offset": 8,
        },
        {
          "nextCluster": 0,
          "offset": 9,
        },
        {
          "nextCluster": 0,
          "offset": 10,
        },
      ]
    `)
  })
})
