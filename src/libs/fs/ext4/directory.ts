import { remove } from 'lodash-es'
import randomColor from 'randomcolor'
import type { Inode } from './inode'

interface File {
  name: string
  inode: number
}

export class Directory {
  hasFile(fileName: string) {
    return this.files.find(file => file.name === fileName)
  }

  inode: number
  files: File[]
  name: string
  color: string

  constructor(inode: number, name: string) {
    this.name = name
    this.inode = inode
    this.files = []
    this.color = randomColor({ luminosity: 'light', seed: name })
  }

  addFile(inode: Inode) {
    this.files.push({
      name: inode.name,
      inode: inode.index,
    })
  }

  getFile(fileName: string) {
    return this.files.find(file => file.name === fileName)
  }

  deleteFile(fileName: string) {
    remove(this.files, { name: fileName })
  }
}
