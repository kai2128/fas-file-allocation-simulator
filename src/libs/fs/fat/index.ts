import { filter, find, findIndex, isEmpty, omit, take } from 'lodash-es'
import parsePath from 'parse-filepath'
import randomColor from 'randomcolor'
import type { Block } from './../../volume/disk'
import type { FSApi } from './../types'
import { isDir, isFile, isValidPath } from './../utils/fs_helper'
import type { Disk } from '~/libs/volume/disk'

export * from './entry'

export interface Fat32_BPB {
  BS_jmpBoot?: number
  BS_OEMName?: number
  BPB_BytesPerSec: number
  BPB_SecPerClus: number
  BPB_RsvdSecCnt: number
  BPB_NumFATs: number
  BPB_RootEntCnt?: number
  BPB_TotSec1: number
  BPB_Media: number
  BPB_FATSz16?: number
  BPB_SecPerTrk?: number
  BPB_NumHeads?: number
  BPB_HiddSec: number
  BPB_TotSec3: number
  BPB_FATSz32: number
  BPB_ExtFlags: number
  BPB_FSVer: number
  BPB_RootClus: number
  FSInfo: number
  BPB_BkBootSec: number
  BPB_Reserved: number
  BS_DrvNu: number
  BS_Reserved: number
  BS_BootSi: number
  BS_VolI: number
  BS_FilSysType: number
}

export interface FileReaded {
  color: string
  dateCreated: number | Date
  diskOffsets: number[]
  firstClusterNumber: number
  name: string
  size: number
  type: 'file' | 'directory'
}

export interface FatItem {
  offset: number
  nextCluster: number | FatItemState
}

export enum FatItemState {
  END_OF_CLUSTER = 0x0FFFFFF8,
  BAD_CLUSTER = 0x0FFFFFF7,
  RESERVED_CLUSTER = 0x0FFFFFF0,
  FREE_CLUSTER = 0x0000000,
}

export interface DirectoryEntry {
  name: string
  type: 'file' | 'directory'
  size: number
  firstClusterNumber: number
  dateCreated: Date | number
}

export interface Directory {
  entry: DirectoryEntry
  childs: Array<DirectoryEntry> // files or directories
  path: string
}

export interface FSInfo {
  freeClusterCount: number
  nextFreeCluster: number | false
}

export class FatFs implements FSApi {
  bpb: Fat32_BPB = {
    BPB_BytesPerSec: 0x0200, // 512
    BPB_SecPerClus: 0x01, // 1
    BPB_RsvdSecCnt: 0x0020, // 32
    BPB_NumFATs: 0x02, // 2
    BPB_RootEntCnt: 0, // 0
    // BPB_TotSec1: 0,
    BPB_Media: 0xF8,
    BPB_FATSz16: 0,
    BPB_SecPerTrk: 0x003F,
    BPB_NumHeads: 0x00FF,
    BPB_HiddSec: 0,
    BPB_TotSec3: 0, // to be set
    BPB_FATSz32: 0, // to be set
    BPB_ExtFlags: 0,
    BPB_FSVer: 0,
    BPB_RootClus: 0, // to be set
    FSInfo: 0,
    BPB_BkBootSec: 0,
    BPB_Reserved: 0,
    BS_DrvNu: 0,

    BPB_TotSec1: 0,
    BS_Reserved: 0,
    BS_BootSi: 0,
    BS_VolI: 0,
    BS_FilSysType: 0,
  }

  fatTable: Array<FatItem> = []
  disk: Disk
  rootDirectory: Directory

  constructor(disk: Disk, options?: Fat32_BPB) {
    Object.assign(this.bpb, options)

    disk.reset()

    this.disk = disk
    // for simplicity, all data unit is the same
    this.bpb.BPB_RsvdSecCnt = 2
    this.bpb.BPB_NumFATs = 2
    this.bpb.BPB_FATSz32 = 1
    this.bpb.BPB_TotSec3 = disk.total_units
    this.bpb.BPB_RootClus = 2

    if (disk.disk_size < this.dataSectorStartingCluster() + 5)
      throw new Error('disk size is too small')
    disk.setReservedList(0, this.dataSectorStartingCluster())
    this.initFatTable()
  }

  public static format(Disk: Disk, options?: Fat32_BPB) {
    return new FatFs(Disk, options)
  }

  fsInfo(): FSInfo {
    return {
      freeClusterCount: this.freeClusterCount(),
      // false if no free cluster available, based on fat table index
      nextFreeCluster: this.getNextFreeCluster() || false,
    }
  }

  // #region file_api
  fs_create(path: string, size: number) {
    if (!isValidPath(path))
      throw new Error('Invalid path')

    if (isFile(path))
      this.createFile(path, size)

    if (isDir(path))
      this.createDirectory(path)
  }

  fs_append(path: string, size: number) {
    const file = this.readFile(path)
    this.appendFile(file, size)
  }

  fs_write(path: string, size: number) {
    this.delete(path)
    this.createFile(path, size)
  }

  fs_read(path: string) {
    this.readFile(path)
  }

  fs_delete(path: string) {
    this.delete(path)
  }
  // #endregion file_api

  // first fit algorithm
  getNextFreeCluster() {
    return findIndex(this.fatTable, item => item.nextCluster === FatItemState.FREE_CLUSTER)
  }

  dataSectorStartingCluster() {
    return this.bpb.BPB_RsvdSecCnt + this.bpb.BPB_NumFATs * this.bpb.BPB_FATSz32
  }

  rootDirectoryCluster() {
    return this.fatTable[2].offset
  }

  private initFatTable() {
    const fatTableLength = this.disk.total_units - this.dataSectorStartingCluster()
    this.fatTable = new Array(fatTableLength).fill({}).map((v, i) => {
      return {
      // offset starts from data sector
        offset: i + this.dataSectorStartingCluster(),
        nextCluster: FatItemState.FREE_CLUSTER,
      }
    })

    // cluster 0 and 1 is reserved
    this.fatTable[0].nextCluster = 0xF8FFF0F
    this.fatTable[1].nextCluster = 0xFFFFFFF

    const createRootDirectory = () => {
      const directory: Directory = {
        entry: {
          dateCreated: Date.now(),
          name: 'root',
          type: 'directory',
          size: 1,
          firstClusterNumber: 2, // root directory allcoated at cluster 2
        },
        childs: [],
        path: '/root',
      }

      this.disk.setUsed(this.fatTable[2].offset, randomColor({ luminosity: 'light', seed: 'root' }), directory)
      // directory is only 1 cluster, so mark end of file
      this.markEndOfFile(2) // update fat table
      return directory
    }

    // cluster 2 is root directory
    this.rootDirectory = createRootDirectory()
  }

  // #region helper
  freeClusterCount() {
    return filter(this.fatTable, v => v.nextCluster === FatItemState.FREE_CLUSTER).length
  }

  markEndOfFile(fatTableIndex: number) {
    this.fatTable[fatTableIndex].nextCluster = FatItemState.END_OF_CLUSTER
  }

  checkSpace(size?: number) {
    if (this.getNextFreeCluster() < 1)
      throw new Error('no space')

    if (size) {
      if (this.freeClusterCount() - size < 1)
        throw new Error('no space')
    }
  }

  checkUniqueFileName(dir: Directory, fileName: string) {
    dir.childs.forEach((child) => {
      if (child.name === fileName)
        throw new Error('file name already exists')
    })
  }

  checkUniqueDirectory(dir: Directory, fileName: string) {
    dir.childs.forEach((child) => {
      if (child.name === fileName)
        throw new Error('Directory name already exists')
    })
  }

  checkExist(obj: any, type = 'file') {
    if (obj == null || obj === undefined)
      throw new Error(`${type} not found`)
  }
  // #endregion

  // ex: /root/123.txt, size = 10
  createFile(path: string, size: number) {
    // if file size is only 1 cluster, then mark end of file
    this.checkSpace(size)
    const parsedPath = parsePath(path)
    const fileName = parsedPath.base // get file name from path
    const dir = this.findDirectory(parsedPath.dir)! // get directory
    const fileColor = randomColor({ luminosity: 'light', seed: path })

    this.checkExist(dir, path)
    this.checkUniqueFileName(dir!, fileName)

    const clusterNumbers = this.getClustersForAllocation(size)
    this.checkExist(clusterNumbers, 'Cluster ')

    const directoryEntry: DirectoryEntry = {
      name: fileName,
      type: 'file',
      size,
      dateCreated: Date.now(),
      firstClusterNumber: clusterNumbers[0],
    }
    // get list of clusters to be allcoted
    for (let i = 0; i < clusterNumbers.length; i++) {
      const clusterNo = clusterNumbers[i]!
      this.disk.setUsed(this.fatTable[clusterNo].offset, fileColor, directoryEntry)
      this.fatTable[clusterNo].nextCluster = clusterNumbers[i + 1] || FatItemState.END_OF_CLUSTER
    }
    dir.childs.push(directoryEntry)
  }

  getClustersForAllocation(size?: number): Array<number> {
    if (!size)
      size = this.fatTable.length
    if (size === 1)
      return [this.getNextFreeCluster()]
    const freeFatIndexes: number[] = []
    this.fatTable.forEach((v, i) => {
      if (v.nextCluster === FatItemState.FREE_CLUSTER)
        freeFatIndexes.push(i)
    })
    return take(freeFatIndexes, size)
  }

  delete(path: string) {
    const parsedPath = parsePath(path)
    const name = parsedPath.base // get file name from path

    if (parsedPath.ext === '') {
      // delete directory (does not have extension name)
      const dir = this.findDirectory(parsedPath.path)!
      this.checkExist(dir)
      this.deleteDirectory(dir)
      return
    }

    // delete file
    const dir = this.findDirectory(parsedPath.dir)!
    const fileDirectoryEntry = this.findFile(dir, name)
    this.checkExist(fileDirectoryEntry)
    this.deleteFile(fileDirectoryEntry!)
  }

  findFile(dir: Directory, fileName: string): DirectoryEntry | undefined {
    return dir.childs.find(v => v.name === fileName && v.type === 'file')
  }

  private deleteFile(dirEntry: DirectoryEntry) {
    const firstCluster = dirEntry.firstClusterNumber

    let nextCluster = firstCluster
    while (true) {
      const fatItem = this.fatTable[nextCluster]
      nextCluster = fatItem.nextCluster

      fatItem.nextCluster = FatItemState.FREE_CLUSTER
      this.disk.setFree(fatItem.offset) // disk will not be updated in real implementation, only fat table update
      if (nextCluster === FatItemState.END_OF_CLUSTER)
        break
    }
  }

  private deleteDirectory(dir: Directory) {
    if (dir.entry.name === 'root')
      throw new Error('root directory cannot be deleted')

    const subDirectoryOrFiles = dir.childs
    if (isEmpty(subDirectoryOrFiles)) {
      this.deleteFile(dir.entry)
      return
    }

    subDirectoryOrFiles.forEach((v) => {
      if (v.type === 'directory')
        this.deleteDirectory(v as any as Directory)
      else
        this.deleteFile(v)
    })
  }

  createDirectory(path: string) {
    this.checkSpace(1)
    const parsedPath = parsePath(path)
    const dirName = parsedPath.name // get file name from path
    const dir = this.findDirectory(parsedPath.dir)! // get directory
    const dirColor = randomColor({ luminosity: 'light', seed: path })

    this.checkExist(dir, parsedPath.dir)
    this.checkUniqueDirectory(dir!, dirName)

    const freeFatIndex = this.getNextFreeCluster()!
    const directory: Directory = {
      entry: {
        dateCreated: Date.now(),
        name: dirName,
        type: 'directory',
        size: 1,
        firstClusterNumber: freeFatIndex,
      },
      childs: [],
      path,
    }

    const clusterToBeAllocated = this.fatTable[freeFatIndex].offset
    this.disk.setUsed(clusterToBeAllocated, dirColor, directory)
    dir.childs.push(directory)
    // directory is only 1 cluster, so mark end of file
    this.markEndOfFile(freeFatIndex) // update fat table
    return directory
  }

  private readCluster(offset: number) {
    return this.disk.readUnit(offset)
  }

  readFile(path: string): FileReaded {
    const fileName = parsePath(path).base
    const dirName = parsePath(path).dir
    const dir = this.findDirectory(dirName)!
    this.checkExist(dir, 'directory')

    const firstCluster = this.getFirstClusterNumberAfterSearchingInDirectory(dir, fileName)
    this.checkExist(firstCluster, path)

    let fatItemNumber = firstCluster!
    const buffer: Array<Block> = []
    while (true) {
      const fatItem = this.fatTable[fatItemNumber]
      buffer.push(this.readCluster(fatItem.offset))
      if (fatItem.nextCluster === FatItemState.END_OF_CLUSTER)
        break

      fatItemNumber = fatItem.nextCluster
    }

    // not related to fat 32
    const first = buffer[0]
    return {
      ...first.state.data,
      color: first.state.color,
      diskOffsets: buffer.map(v => v.offset),
    }
  }

  appendFile(file: FileReaded, size: number) {
    this.checkSpace(size)

    const clusterNumbers = this.getClustersForAllocation(size)
    this.checkExist(clusterNumbers, 'Cluster ')
    const oldLastFatItem = this.getLastFatItem(file.firstClusterNumber)
    oldLastFatItem.nextCluster = clusterNumbers[0] // points last item to next cluster

    for (let i = 0; i < clusterNumbers.length; i++) {
      const clusterNo = clusterNumbers[i]!
      this.disk.setUsed(this.fatTable[clusterNo].offset, file.color, omit(file, ['diskOffsets', 'color']))
      this.fatTable[clusterNo].nextCluster = clusterNumbers[i + 1] || FatItemState.END_OF_CLUSTER
    }
  }

  getLastFatItem(firstClusterNumber: number) {
    let fatItemNumber = firstClusterNumber
    while (true) {
      const fatItem = this.fatTable[fatItemNumber]
      if (fatItem.nextCluster === FatItemState.END_OF_CLUSTER)
        break
      fatItemNumber = fatItem.nextCluster
    }
    return this.fatTable[fatItemNumber]
  }

  getFirstClusterNumberAfterSearchingInDirectory(dir: Directory, fileName: string) {
    return dir.childs.find(child => child.name === fileName)?.firstClusterNumber
  }

  // input: /root/dir1/dir2
  findDirectory(dirPath: string): Directory | null {
    const currentDir = this.rootDirectory
    if (dirPath === '/root') { // search in root directory
      return currentDir
    }

    const directories = this.getAllDirectories(currentDir)
    return find(directories, dir => dir.path === dirPath) || null
  }

  getAllDirectories(dir: Directory): Directory[] {
    const dirs: Directory[] = []
    dirs.push(dir)
    if (dir.childs !== null) {
      dir.childs.forEach((child: any) => {
        if (child.entry?.type === 'directory') {
          dirs.push(child as any as Directory)
          this.getAllDirectoriesRecursive(child as any as Directory, dirs)
        }
      })
    }
    return dirs
  }

  getAllDirectoriesRecursive(dir: Directory, dirs: Directory[]) {
    dir.childs.forEach((child: DirectoryEntry) => {
      if (child.type === 'directory') {
        dirs.push(child as any as Directory)
        this.getAllDirectoriesRecursive(child as any as Directory, dirs)
      }
    })
  }

  rootDirectoryEntry() {
    return this.rootDirectory.entry
  }
}
