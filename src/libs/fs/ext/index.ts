import { disk_block_size } from '~/libs/volume'

export interface ISuperblock {
  num_inodes: number
  num_blocks: number
  size_blocks: number
}

export interface IInode {
  size: number
  name: string
}

export interface IDiskBlock {
  next_block_num: number
  data: string
}

let sb: ISuperblock
const inodes: IInode[] = []
const dbs: IDiskBlock[] = []

// initialize fs
function create_fs() {
  sb.num_inodes = 10
  sb.num_blocks = 10
  sb.size_blocks = disk_block_size

  inodes.length = sb.num_inodes
  inodes.forEach((inode) => {
    inode.size = -1
    inode.name = ''
  })

  dbs.length = disk_block_size * sb.num_blocks
  for (let i = 0; i < sb.num_blocks; i++) {
    dbs[i].next_block_num = -1
  }


}

// load fs
function mount_fs() {

}

// write fs
function sync_fs() {

}
