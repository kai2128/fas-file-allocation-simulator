import { cloneDeep, filter } from 'lodash-es'
import type { FSApi, FileDetails, FileReaded } from './../types'
import { Bitmap } from './bitmap'
import { Directory } from './directory'
import { Inode } from './inode'
import { InodeTable } from './inodeTable'
import { ExtentTree } from './extent'
import type { Disk } from '~/libs/volume'
import { ERRCODE, FSError } from '~/libs/error/fserror'

export class Ext4 implements FSApi {
  name = 'ext4'
  inodeBitmap: Bitmap[]
  blockBitmap: Bitmap[]
  inodeTable: InodeTable
  rootDirectory: Directory
  disk: Disk

  constructor(disk: Disk) {
    this.disk = disk
    this.inodeBitmap = new Array(disk.disk_size).fill({}).map((v, i) => {
      return new Bitmap(i)
    })
    this.blockBitmap = new Array(disk.disk_size).fill({}).map((v, i) => {
      return new Bitmap(i)
    })
    this.inodeTable = new InodeTable(disk.disk_size)
    this.rootDirectory = this.createRootDirectory()
  }

  createRootDirectory(): Directory {
    const inodeNumber = this.getFreeInodeIndex().index
    const root = new Directory(inodeNumber, '/')
    const inode = new Inode(inodeNumber, '/', 1, this.blockBitmap, 'directory')
    this.updateInodeTable(inode)
    this.writeToDisk(inode)
    return root
  }

  updateInodeTable(inode: Inode) {
    this.inodeTable.inodes[inode.index] = inode
    this.inodeBitmap[inode.index].setUsed()
  }

  writeToDisk(inode: Inode): void {
    const blocks = inode.extentTree.getAllocatedBlocks()
    blocks.forEach((block) => {
      this.blockBitmap[block].setUsed()
      this.disk.setUsed(block, inode.color, inode)
    })
  }

  getFreeInodeIndex() {
    return this.inodeBitmap.find(v => v.free)!
  }

  checkSpace(size?: number) {
    const freeBlocks = filter(this.blockBitmap, bitmap => bitmap.free)
    if (freeBlocks.length < 1)
      throw new FSError(ERRCODE.ESPACE, 'no enough free block')

    if (size) {
      if (freeBlocks.length - size < 0)
        throw new FSError(ERRCODE.ESPACE, 'no enough free block')
    }
  }

  checkFileExist(fileName: string) {
    if (!this.rootDirectory.hasFile(fileName))
      throw new FSError(ERRCODE.ENOENT, 'file not found')
  }

  checkUniqueFileName(fileName: string) {
    if (this.rootDirectory.hasFile(fileName))
      throw new FSError(ERRCODE.EEXIST, `${fileName} already exists`)
  }

  fs_searchFileInDirectory(fileName: string): FileDetails | null {
    try {
      this.checkFileExist(fileName)
    }
    catch {
      return null
    }
    const inode = this.getInodeFromDirectory(fileName)
    return {
      color: inode.color,
      name: inode.name,
      size: inode.size,
      type: inode.type,
      dateCreated: inode.dateCreated,
      inodeNumber: inode.index,
    }
  }

  getInodeFromDirectory(fileName: string) {
    const inodeNumber = this.rootDirectory.getFile(fileName)!.inode
    return this.inodeTable.inodes[inodeNumber]
  }

  createFile(fileName: string, size: number): void {
    size = Number(size)
    this.checkSpace(size)
    this.checkUniqueFileName(fileName)

    const inode = new Inode(this.getFreeInodeIndex().index, fileName, size, this.blockBitmap)
    this.updateInodeTable(inode)
    this.writeToDisk(inode)
    this.rootDirectory.addFile(inode)
  }

  deleteFile(fileName: string): void {
    this.checkFileExist(fileName)

    const inode = this.getInodeFromDirectory(fileName)
    this.rootDirectory.deleteFile(fileName)
    inode.setAllocatedBlockFree(this.blockBitmap, this.disk)
    inode.setFree()
    this.inodeBitmap[inode.index].setFree()
  }

  readFile(fileName: string): Inode {
    this.checkFileExist(fileName)
    const inode = this.getInodeFromDirectory(fileName)
    return inode
  }

  writeFile(fileName: string, size: number): void {
    size = Number(size)
    this.checkFileExist(fileName)
    const inode = this.getInodeFromDirectory(fileName)

    if (size > inode.size) { // only check disk space if new size is larger than old size{
      this.checkSpace(size - inode.size)
    }

    this.deleteFile(fileName)
    this.createFile(fileName, size)
  }

  appendFile(fileName: string, size: number): void {
    size = Number(size)
    this.checkFileExist(fileName)
    this.checkSpace(size)
    const inode = this.getInodeFromDirectory(fileName)
    inode.setSize(size, 'append')
    inode.extentTree.fileSize = inode.size
    inode.extentTree.appendBlockToExtent(size, this.blockBitmap)
    inode.extentTree.mergeExtents()
    this.writeToDisk(inode)
  }

  static format(disk: Disk) {
    const fs = new Ext4(disk)
    log(`Created disk with size of ${disk.total_units} and formatted with ${fs.name}`)
    return fs
  }

  fs_create(fileName: string, size: number): void {
    this.checkUniqueFileName(fileName)
    this.createFile(fileName, size)
    log(`File ${fileName} created with size ${size}.`)
  }

  fs_append(fileName: string, size: number): void {
    this.appendFile(fileName, size)
    log(`File ${fileName} appended with size ${size}.`)
  }

  fs_read(fileName: string): void {
    this.readFile(fileName)
    log(`File ${fileName} read.`)
  }

  fs_delete(fileName: string): void {
    this.deleteFile(fileName)
    log(`File ${fileName} deleted.`)
  }

  fs_write(fileName: string, size: number): void {
    this.writeFile(fileName, size)
    log(`File ${fileName} written with size ${size}.`)
  }

  fs_defragmentation(): void {
    this.rootDirectory.files.forEach((file) => {
      const inode = this.getInodeFromDirectory(file.name)
      inode.setAllocatedBlockFree(this.blockBitmap, this.disk)
    })

    this.rootDirectory.files.forEach((file) => {
      const inode = this.getInodeFromDirectory(file.name)
      inode.extentTree = new ExtentTree(inode.size, this.blockBitmap)
      inode.extentTree.allocateFreeBlockToExtent(this.blockBitmap)
      this.writeToDisk(inode)
    })
    log('Defragmentation done.')
  }

  get fs_files(): FileReaded[] {
    return this.rootDirectory.files.map((v) => {
      const inode = this.inodeTable.inodes[v.inode]
      return {
        data: {
          name: inode.name,
          size: inode.size,
          dateCreated: inode.dateCreated,
          inodeNumber: inode.index,
          color: inode.color,
          type: inode.type,
        },
      }
    })
  }

  clone(disk: Disk): FSApi {
    const cloneFs = new Ext4(disk)
    cloneFs.inodeBitmap = cloneDeep(this.inodeBitmap)
    cloneFs.blockBitmap = cloneDeep(this.blockBitmap)
    cloneFs.inodeTable = cloneDeep(this.inodeTable)
    cloneFs.rootDirectory = cloneDeep(this.rootDirectory)
    cloneFs.disk = disk
    cloneFs.name = this.name
    return cloneFs
  }
}
