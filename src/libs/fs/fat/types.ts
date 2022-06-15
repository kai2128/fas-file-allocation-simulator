import type { FatItem } from './fatTable'

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
  data: FileDetails
  diskOffsets: Array<number>
  fatIndexes: Array<number>
  fatItems: Array<FatItem>
}
export interface FileDetails {
  color: string
  dateCreated: number | Date
  diskOffsets: number[]
  firstClusterNumber: number
  name: string
  size: number
  type: 'file' | 'directory'
}

export interface Directory {
  entry: DirectoryEntry
  files: Array<DirectoryEntry> // files or directories
  path: string
}
export interface DirectoryEntry {
  name: string
  type: 'file' | 'directory'
  size: number
  firstClusterNumber: number
  dateCreated: Date | number
}

export interface FSInfo {
  freeClusterCount: number
  nextFreeCluster: number | false
}


