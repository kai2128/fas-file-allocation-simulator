import { filter, find, findIndex, omit, remove } from 'lodash-es'
import randomColor from 'randomcolor'
import type { FSApi } from './../types'
import type { Directory, DirectoryEntry, FSInfo, Fat32_BPB, FileReaded } from './types'
import type { FatItem } from './fatTable'
import { FatItemState, FatTable } from './fatTable'

import { ERRCODE, ERRSTR, FSError } from '~/libs/error/fserror'
import type { Block, Disk } from '~/libs/volume/disk'

export class FatFs implements FSApi {
  name = 'FAT'

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

  fatTable: FatTable = new FatTable(0, 0)
  disk: Disk
  rootDirectory: Directory

  private constructor(disk: Disk, options?: Fat32_BPB) {
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
      throw new FSError(ERRCODE.ESPACE, ERRSTR.SIZE)
    disk.setReservedList(0, this.dataSectorStartingCluster())
    this.initFatTable()
  }

  static format(Disk: Disk, options?: Fat32_BPB) {
    return new FatFs(Disk, options)
  }

  private initFatTable() {
    const fatTableLength = this.disk.total_units - this.dataSectorStartingCluster()
    this.fatTable = new FatTable(fatTableLength, this.dataSectorStartingCluster())
    this.fatTable.initTable()

    const createRootDirectory = () => {
      const directory: Directory = {
        entry: {
          dateCreated: Date.now(),
          name: 'root',
          type: 'directory',
          size: 1,
          firstClusterNumber: 2, // root directory allcoated at cluster 2
        },
        files: [],
        path: '/root',
      }

      this.disk.setUsed(this.fatTable.getFatItem(2).offset, randomColor({ luminosity: 'light', seed: 'root' }), directory)
      // directory is only 1 cluster, so mark end of file
      this.fatTable.markEndOfFile(2) // update fat table
      return directory
    }

    // cluster 2 is root directory
    this.rootDirectory = createRootDirectory()
  }

  createFile(fileName: string, size: number) {
    // if file size is only 1 cluster, then mark end of file
    this.checkSpace(size)
    this.checkUniqueFileName(fileName)

    const fileColor = randomColor({ luminosity: 'light', seed: fileName })
    const fatIndexes = this.fatTable.getFatIndexesForAllocation(size)
    this.checkExist(fatIndexes, 'Cluster ')

    const directoryEntry: DirectoryEntry = {
      name: fileName,
      type: 'file',
      size,
      dateCreated: Date.now(),
      firstClusterNumber: fatIndexes[0],
    }
    // write to disk and update fat table
    for (let i = 0; i < fatIndexes.length; i++) {
      const fatIndex = fatIndexes[i]!
      this.disk.setUsed(this.fatTable.getFatItem(fatIndex).offset, fileColor, directoryEntry)
      this.fatTable.getFatItem(fatIndex).nextCluster = fatIndexes[i + 1] || FatItemState.END_OF_CLUSTER
    }
    this.rootDirectory.files.push(directoryEntry)
  }

  deleteFile(fileName: string) {
    const searchFile = (fileName: string) => {
      const files = this.rootDirectory.files
      const dirEntry = find(files, { name: fileName })
      this.checkExist(dirEntry, fileName)
      return dirEntry
    }
    const firstCluster = searchFile(fileName)!.firstClusterNumber

    let nextCluster = firstCluster
    while (true) {
      const fatItem = this.fatTable.getFatItem(nextCluster)
      nextCluster = fatItem.nextCluster

      fatItem.nextCluster = FatItemState.FREE_CLUSTER
      this.disk.setFree(fatItem.offset) // disk will not be updated in real implementation, only fat table update
      if (nextCluster === FatItemState.END_OF_CLUSTER)
        break
    }
    remove(this.rootDirectory.files, { name: fileName })
  }

  readFile(fileName: string): FileReaded {
    const firstCluster = this.getFirstClusterNumberAfterSearchingInDirectory(fileName)
    this.checkExist(firstCluster, fileName)

    let fatItemNumber = firstCluster!
    const buffer: Array<Block> = []
    const fatItems = []
    const fatIndexes = []
    while (true) {
      const fatItem = this.fatTable.getFatItem(fatItemNumber)
      fatIndexes.push(fatItemNumber)
      fatItems.push(fatItem)
      buffer.push(this.readCluster(fatItem.offset))
      if (fatItem.nextCluster === FatItemState.END_OF_CLUSTER)
        break

      fatItemNumber = fatItem.nextCluster
    }

    // not related to fat 32
    const first = buffer[0]
    return {
      data: first.state.data,
      diskOffsets: buffer.map(v => v.offset),
      fatIndexes,
      fatItems,
    }
  }

  appendFile(fileName: string, size: number) {
    this.checkSpace(size)
    const fatItemIndexes = this.fatTable.getFatIndexesForAllocation(size)
    this.checkExist(fatItemIndexes, 'cluster not enough')
    const file = this.readFile(fileName)
    this.checkExist(file, fileName)

    const oldLastFatItem = this.getLastFatItem(file.data.firstClusterNumber)
    oldLastFatItem.nextCluster = fatItemIndexes[0] // points last item to next cluster

    for (let i = 0; i < fatItemIndexes.length; i++) {
      const fatItemIndex = fatItemIndexes[i]!
      this.disk.setUsed(this.fatTable.getFatItem(fatItemIndex).offset, file.data.color, file.data)
      this.fatTable.getFatItem(fatItemIndex).nextCluster = fatItemIndexes[i + 1] || FatItemState.END_OF_CLUSTER
    }
  }

  // #region fat table
  getLastFatItem(firstClusterNumber: number): FatItem {
    let fatItemNumber = firstClusterNumber
    while (true) {
      const fatItem = this.fatTable.getFatItem(fatItemNumber)
      if (fatItem.nextCluster === FatItemState.END_OF_CLUSTER)
        break
      fatItemNumber = fatItem.nextCluster
    }
    return this.fatTable.getFatItem(fatItemNumber)
  }
  // #endregion

  // #region root directory
  getFirstClusterNumberAfterSearchingInDirectory(fileName: string) {
    return this.searchFileInDirectory(fileName)?.firstClusterNumber
  }

  searchFileInDirectory(fileName: string) {
    return this.rootDirectory.files.find(file => file.name === fileName)
  }
  // #endregion

  // #region props
  rootDirectoryEntry() {
    return this.rootDirectory.entry
  }

  dataSectorStartingCluster() {
    return this.bpb.BPB_RsvdSecCnt + this.bpb.BPB_NumFATs * this.bpb.BPB_FATSz32
  }

  fsInfo(): FSInfo {
    return {
      freeClusterCount: this.fatTable.freeClusterCount(),
      // false if no free cluster available, based on fat table index
      nextFreeCluster: this.fatTable.getNextFreeCluster() || -1,
    }
  }
  // #endregion props

  // #region helper
  private readCluster(offset: number) {
    return this.disk.readUnit(offset)
  }

  checkSpace(size?: number) {
    if (this.fatTable.getNextFreeCluster() < 1)
      throw new FSError(ERRCODE.ESPACE, 'no enough free cluster')

    if (size) {
      if (this.fatTable.freeClusterCount() - size < 1)
        throw new FSError(ERRCODE.ESPACE, 'no enough free cluster')
    }
  }

  checkUniqueFileName(fileName: string) {
    this.rootDirectory.files.forEach((child) => {
      if (child.name === fileName)
        throw new FSError(ERRCODE.EEXIST, `${fileName} already exists`)
    })
  }

  checkExist(obj: any, name = 'file') {
    if (obj == null || obj === undefined)
      throw new FSError(ERRCODE.ENOENT, `${name} not found`)
  }
  // #endregion

  // #region FSApi
  fs_create(fileName: string, size: number) {
    this.createFile(fileName, size)
  }

  fs_append(fileName: string, size: number) {
    this.appendFile(fileName, size)
  }

  fs_write(fileName: string, size: number) {
    this.deleteFile(fileName)
    this.createFile(fileName, size)
  }

  fs_read(fileName: string) {
    this.readFile(fileName)
  }

  fs_delete(fileName: string) {
    this.deleteFile(fileName)
  }
  // #endregion
}
