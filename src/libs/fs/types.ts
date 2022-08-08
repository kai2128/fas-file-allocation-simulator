import type { Disk } from '../volume'
import type { Step } from '~/composables/actions'

export interface FSApi {
  name: string
  fs_create(fileName: string, size: number): void
  fs_append(fileName: string, size: number): void
  fs_read(fileName: string): void
  fs_delete(fileName: string): void
  fs_write(fileName: string, size: number): void
  fs_defragmentation(): void
  fs_files: Array<FileReaded>
  clone: (disk: Disk) => FSApi
  checkUniqueFileName: (fileName: string) => void
  checkSpace: (size: number) => void
  checkExist: (fileName: string) => void
  fs_searchFileInDirectory: (fileName: string) => FileDetails
}

export interface FileReaded {
  data: FileDetails
}

export interface FileDetails {
  color: string
  name: string
  size: number
  type: 'file' | 'directory'
  dateCreated: Date | number
  firstClusterNumber?: number
  inodeNumber?: number
}

export interface FSActions {
  create: {
    steps: Step[]
  }
  delete: {
    steps: Step[]
  }
  append: {
    steps: Step[]
  }
  write: {
    steps: Step[]
  }
  read: {
    steps: Step[]
  }
}
