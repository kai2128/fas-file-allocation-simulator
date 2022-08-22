import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { Ext4 } from '~/libs/fs/ext4'
import { Disk } from '~/libs/volume'

function setupExt() {
  const disk = new Disk(20)
  return {
    disk,
    ext4: Ext4.format(disk),
    freeBlocks: disk.disk_size - 1,
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

describe('ext4 unit test', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2020-01-01T00:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('format disk with ext4', () => {
    const { ext4, disk } = setupExt()
    expect(ext4.inodeTable.inodes.length).toBe(disk.disk_size)
    expect(ext4.inodeBitmap.length).toBe(disk.disk_size)
    expect(ext4.blockBitmap.length).toBe(disk.disk_size)
    for (let i = 0; i < disk.disk_size; i++) {
      if (i === 0) {
        expect(ext4.inodeBitmap[i].used).toBe(true)
        expect(ext4.blockBitmap[i].used).toBe(true)
        continue
      }
      expect(ext4.inodeBitmap[i].free).toBe(true)
      expect(ext4.blockBitmap[i].free).toBe(true)
    }
  })

  test('create file', () => {
    const { ext4 } = setupExt()
    ext4.createFile(testFile.name, testFile.size)

    expect(ext4.rootDirectory.files[0].name).toBe(testFile.name)
    expect(ext4.rootDirectory.files[0].inode).toBe(1)
    expect(ext4.inodeTable.inodes[1].entry.name).toBe(testFile.name)
    expect(ext4.inodeTable.inodes[1].entry.size).toBe(testFile.size)

    expect(ext4.inodeBitmap[1].used).toBe(true)

    for (let i = 1; i < testFile.size; i++)
      expect(ext4.blockBitmap[i].used).toBe(true)
  })

  test('delete file', () => {
    const { ext4 } = setupExt()
    ext4.createFile(testFile.name, testFile.size)
    ext4.deleteFile(testFile.name)

    expect(ext4.rootDirectory.files.length).toBe(0)
    expect(ext4.inodeTable.inodes[1].entry.name).toBe('DELETED')
    expect(ext4.inodeTable.inodes[1].entry.size).toBe(0)

    expect(ext4.inodeBitmap[1].free).toBe(true)
    for (let i = 1; i < testFile.size; i++)
      expect(ext4.blockBitmap[i].free).toBe(true)
  })

  test('read file', () => {
    const { ext4 } = setupExt()
    ext4.createFile(testFile.name, testFile.size)
    const readedInode = ext4.readFile(testFile.name)
    expect(readedInode.name).toBe(testFile.name)
    expect(readedInode.size).toBe(testFile.size)
    expect(readedInode.index).toBe(1)
  })

  test('append file', () => {
    const { ext4 } = setupExt()
    ext4.createFile(testFile.name, testFile.size)
    ext4.appendFile(testFile.name, testFile.appendSize)

    expect(ext4.rootDirectory.files[0].name).toBe(testFile.name)
    expect(ext4.rootDirectory.files[0].inode).toBe(1)
    expect(ext4.inodeTable.inodes[1].entry.name).toBe(testFile.name)
    expect(ext4.inodeTable.inodes[1].entry.size).toBe(testFile.sizeAfterAppend)

    expect(ext4.inodeBitmap[1].used).toBe(true)
    for (let i = 1; i < testFile.sizeAfterAppend; i++)
      expect(ext4.blockBitmap[i].used).toBe(true)
  })

  test('write file', () => {
    const { ext4 } = setupExt()
    ext4.createFile(testFile.name, testFile.size)
    ext4.writeFile(testFile.name, testFile.writeSize)

    expect(ext4.rootDirectory.files[0].name).toBe(testFile.name)
    expect(ext4.rootDirectory.files[0].inode).toBe(1)
    expect(ext4.inodeTable.inodes[1].entry.name).toBe(testFile.name)
    expect(ext4.inodeTable.inodes[1].entry.size).toBe(testFile.sizeAfterWrite)

    expect(ext4.inodeBitmap[1].used).toBe(true)

    for (let i = 1; i < testFile.sizeAfterWrite; i++)
      expect(ext4.blockBitmap[i].used).toBe(true)

    expect(ext4.blockBitmap[3].free).toBe(true)
  })
})

