import range from 'lodash-es/range'

export interface DiskOptions {
  size_per_unit: number
}

export enum BlockColor {
  reserved = '#c0d1d8',
  free = '#ffffff',
}

export interface BlockState {
  used: boolean
  free: boolean
  reserved: boolean
  color: BlockColor | string
  data?: any
  [key: string]: any
}

export interface Block {
  offset: number
  state: BlockState
}

export function generateState(state: 'free' | 'reserved' | 'used', color: string = BlockColor.free, data?: any): BlockState {
  const blockState: BlockState = {
    reserved: false,
    free: false,
    used: false,
    color,
    data,
  }
  switch (state) {
    case 'free':
      blockState.free = true
      blockState.color = BlockColor.free
      blockState.data = {} as any
      break
    case 'reserved':
      blockState.reserved = true
      blockState.used = true
      blockState.color = BlockColor.reserved
      break
    case 'used':
      blockState.used = true
      break
  }
  return blockState
}

export class Disk {
  size_per_block: number
  total_units: number
  disk_size: number
  units: Array<Block> = []
  total_size: number

  constructor(total_size: number, size_per_unit = 1) {
    this.size_per_block = size_per_unit
    this.total_size = total_size
    this.total_units = total_size / size_per_unit
    this.disk_size = this.total_units * size_per_unit
    this.reset()
  }

  readUnit(offset: number) {
    return this.units[offset]
  }

  read(from: number, until: number) {
    return this.units.slice(from, until)
  }

  writeUnit(offset: number, blockState: BlockState) {
    this.write(offset, offset, blockState)
  }

  writeSize(offset: number, size: number, blockState: BlockState) {
    this.write(offset, offset + size, blockState)
  }

  write(from: number, until: number | undefined, blockState: BlockState): void {
    if (!until)
      until = from
    range(from, until + 1).forEach((i) => {
      this.units[i].state = blockState
    })
  }

  reset() {
    this.units = new Array(this.total_units).fill({}).map((v, i) => {
      return {
        offset: i,
        state: generateState('free'),
      }
    })
  }

  setReserved(offset: number, color: BlockColor | string, data?: any) {
    this.write(offset, undefined, generateState('reserved', color, data))
  }

  setFree(offset: number) {
    this.write(offset, undefined, generateState('free'))
  }

  setUsed(offset: number, color: BlockColor | string, data?: any) {
    this.write(offset, undefined, generateState('used', color, data))
  }

  setReservedSize(offset: number, size: number, color?: BlockColor | string, data?: any) {
    this.writeSize(offset, size, generateState('reserved', color, data))
  }

  setFreeSize(offset: number, size: number) {
    this.write(offset, size, generateState('free'))
  }

  setUsedSize(offset: number, size: number, color: BlockColor | string, data?: any) {
    this.write(offset, size, generateState('used', color, data))
  }

  setReservedList(from: number, until: number, color?: BlockColor | string, data?: any) {
    this.write(from, until, generateState('reserved', color, data))
  }

  setFreeList(from: number, until?: number) {
    this.write(from, until, generateState('free'))
  }

  setUsedList(from: number, until: number, color: BlockColor | string, data?: any) {
    this.write(from, until, generateState('used', color, data))
  }
}

