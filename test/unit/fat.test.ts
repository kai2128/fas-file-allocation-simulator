import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { FatFs, FatItemState } from '~/libs/fs/fat'
import { Disk } from '~/libs/volume'

function setupFat() {
  const disk = new Disk(20)
  return {
    disk,
    fat: FatFs.format(disk),
    freeClusterCount: disk.disk_size - 7,
  }
}
const testFile = {
  name: 'test.txt',
  size: 3,
  appendSize: 2,
  sizeAfterAppend: 5,
  writeSize: 2,
  sizeAfterWrite: 2,
}

describe('FAT unit test', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2020-01-01T00:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('format disk with FAT', () => {
    const { fat, freeClusterCount, disk } = setupFat()

    // 0, 1 is reserved for flag, 2 is root directory
    for (let i = 0; i < 6; i++)
      expect(disk.units[i].state.reserved).toBe(true)

    // root directory is stored at disk block 6
    expect(disk.units[6].state.used).toBe(true)
    // total disk size = 20, reserved = 6, root directory = 1, free cluster = 13
    expect(fat.fatTable.freeClusterCount()).toBe(freeClusterCount)
  })

  test('create file', () => {
    const { fat, freeClusterCount } = setupFat()
    fat.createFile(testFile.name, testFile.size)
    const firstClusterNumber = 3

    // check root directory contains file
    expect(fat.rootDirectory.files[0].name).toBe(testFile.name)
    expect(fat.rootDirectory.files[0].size).toBe(testFile.size)
    expect(fat.rootDirectory.files[0].firstClusterNumber).toBe(firstClusterNumber)

    // check fat table is updated correctly
    expect(fat.fatTable.table[3].nextCluster).toBe(4)
    expect(fat.fatTable.table[4].nextCluster).toBe(5)
    expect(fat.fatTable.table[5].nextCluster).toBe(FatItemState.END_OF_CLUSTER)

    expect(fat.fatTable.freeClusterCount()).toBe(freeClusterCount - testFile.size)
  })

  test('delete file', () => {
    const { fat, freeClusterCount } = setupFat()
    fat.createFile(testFile.name, testFile.size)
    fat.deleteFile(testFile.name)
    expect(fat.rootDirectory.files.length).toBe(0)
    expect(fat.fatTable.table[3].nextCluster).toBe(FatItemState.FREE_CLUSTER)
    expect(fat.fatTable.freeClusterCount()).toBe(freeClusterCount)
  })

  test('append file', () => {
    const { fat, freeClusterCount } = setupFat()
    fat.createFile(testFile.name, testFile.size)
    fat.appendFile(testFile.name, testFile.appendSize)
    expect(fat.rootDirectory.files[0].size).toBe(testFile.sizeAfterAppend)
    // check fat table is updated correctly
    expect(fat.fatTable.table[3].nextCluster).toBe(4)
    expect(fat.fatTable.table[4].nextCluster).toBe(5)
    expect(fat.fatTable.table[5].nextCluster).toBe(6)
    expect(fat.fatTable.table[6].nextCluster).toBe(7)
    expect(fat.fatTable.table[7].nextCluster).toBe(FatItemState.END_OF_CLUSTER)

    expect(fat.fatTable.freeClusterCount()).toBe(freeClusterCount - testFile.sizeAfterAppend)
  })

  test('write file', () => {
    const { fat, freeClusterCount } = setupFat()
    fat.createFile(testFile.name, testFile.size)
    fat.fs_write(testFile.name, testFile.writeSize)
    expect(fat.rootDirectory.files[0].size).toBe(testFile.sizeAfterWrite)
    // check fat table is updated correctly
    expect(fat.fatTable.table[3].nextCluster).toBe(4)
    expect(fat.fatTable.table[4].nextCluster).toBe(FatItemState.END_OF_CLUSTER)

    expect(fat.fatTable.freeClusterCount()).toBe(freeClusterCount - testFile.sizeAfterWrite)
  })
})
