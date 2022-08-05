import { Inode } from './inode'

export class InodeTable {
  inodes: Inode[] = []

  // 1 inode for each disk block
  constructor(diskSize: number) {
    this.inodes.length = diskSize
  }

  getInode(inode: number) {
    return this.inodes[inode]
  }
}
