import { Inode } from './inode'

export class InodeTable {
  inodes: Inode[] = []

  // 1 inode for each disk block
  constructor(diskSize: number) {
    this.inodes.length = diskSize
  }

  getInode(inode: number) {
    if (inode > this.inodes.length)
      return this.inodes[0]

    let _inode = this.inodes[inode]
    if (!_inode) {
      _inode = new Inode(inode, '', 0, [], 'file')
      this.inodes[inode] = _inode
    }
    return _inode
  }
}
