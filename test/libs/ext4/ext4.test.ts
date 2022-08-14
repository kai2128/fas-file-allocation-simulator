import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { Ext4 } from '~/libs/fs/ext4'
import { Disk } from '~/libs/volume'

function setupExt() {
  const disk = new Disk(20)
  return {
    disk,
    ext4: Ext4.format(disk),
  }
}

describe('ext4 test', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2020-01-01T00:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('format correctly', () => {
    const { ext4 } = setupExt()
    expect(ext4.inodeTable).toMatchSnapshot()
    expect(ext4.rootDirectory).toMatchInlineSnapshot(`
      Directory {
        "color": "#fcb874",
        "files": [],
        "inode": 0,
        "name": "/",
      }
    `)
    expect(ext4.inodeBitmap).toMatchSnapshot()
    expect(ext4.blockBitmap).toMatchSnapshot()
  })

  test('create file', () => {
    const { ext4, disk } = setupExt()
    ext4.createFile('test.txt', 2)
    expect(ext4.inodeTable.inodes[1].entry).toMatchSnapshot()
    expect(ext4.rootDirectory).toMatchSnapshot()
    expect(disk.read(1, 2)).toMatchSnapshot()
  })

  test('delete file', () => {
    const { ext4, disk } = setupExt()
    ext4.createFile('test.txt', 2)
    ext4.deleteFile('test.txt')
    expect(ext4.inodeTable.inodes[1].entry).toMatchSnapshot()
    expect(ext4.rootDirectory).toMatchSnapshot()
    expect(disk.read(1, 2)).toMatchSnapshot()
  })

  test('write file', () => {
    const { ext4, disk } = setupExt()
    ext4.createFile('test.txt', 2)
    ext4.writeFile('test.txt', 4)
    expect(ext4.inodeTable.inodes[1].entry).toMatchSnapshot()
    expect(ext4.rootDirectory).toMatchSnapshot()
    expect(disk.read(1, 4)).toMatchSnapshot()
  })

  test('append file', () => {
    const { ext4, disk } = setupExt()
    ext4.createFile('test.txt', 2)
    ext4.appendFile('test.txt', 4)
    expect(ext4.inodeTable.inodes[1].entry).toMatchSnapshot()
    expect(ext4.rootDirectory).toMatchSnapshot()
    expect(ext4.inodeTable.inodes[1].allocatedBlock).toMatchSnapshot()
    expect(disk.readUnit(1)).toMatchSnapshot()
    expect(disk.readUnit(6)).toMatchSnapshot()
    ext4.appendFile('test.txt', 1)
    expect(disk.readUnit(7)).toMatchSnapshot()
  })

  test('allocating file without contiguously', () => {
    const { ext4, disk } = setupExt()
    ext4.createFile('test.txt', 2)
    ext4.createFile('test2.txt', 2)
    ext4.createFile('test3.txt', 2)
    ext4.writeFile('test2.txt', 1)
    ext4.appendFile('test.txt', 3)
    expect(ext4.inodeTable.inodes[1].entry).toMatchSnapshot()
    expect(ext4.inodeTable.inodes[2].entry).toMatchSnapshot()
    expect(ext4.inodeTable.inodes[3].entry).toMatchSnapshot()
    expect(disk.read(1, 8)).toMatchSnapshot()
  })
})
