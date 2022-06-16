import { filter, findIndex, take } from 'lodash-es'
import { BlockColor } from '~/libs/volume'

export enum FatItemState {
  END_OF_CLUSTER = 0x0FFFFFF8,
  BAD_CLUSTER = 0x0FFFFFF7,
  RESERVED_CLUSTER = 0x0FFFFFF0,
  FREE_CLUSTER = 0x0000000,
}

export class FatTable {
  table: Array<FatItem>

  constructor(fatTableLength: number, dataSectorStartingCluster: number) {
    this.table = new Array(fatTableLength).fill({}).map((v, i) => {
      return new FatItem(i + dataSectorStartingCluster, FatItemState.FREE_CLUSTER, 'free', BlockColor.free)
    })
  }

  initTable() {
    // cluster 0 and 1 is reserved
    this.table[0].setState(0xF8FFF0F, '-', BlockColor.reserved)
    this.table[1].setState(0xFFFFFFF, '-', BlockColor.reserved)
  }

  getFatItem(fatIndex: number): FatItem {
    return this.table[fatIndex]
  }

  markEndOfFile(fatIndex: number) {
    this.table[fatIndex].markAsEndOfFile()
  }

  getFatIndexesForAllocation(size?: number): Array<number> {
    if (!size)
      size = this.table.length
    if (size === 1)
      return [this.getNextFreeCluster()]
    const freeFatIndexes: number[] = []
    this.table.forEach((v, i) => {
      if (v.nextCluster === FatItemState.FREE_CLUSTER)
        freeFatIndexes.push(i)
    })
    return take(freeFatIndexes, size)
  }

  freeClusterCount() {
    return filter(this.table, v => v.nextCluster === FatItemState.FREE_CLUSTER).length
  }

  getNextFreeCluster() {
    return findIndex(this.table, item => item.nextCluster === FatItemState.FREE_CLUSTER)
  }
}

export class FatItem {
  offset: number // maps to disk sectors
  nextCluster: number | FatItemState // points to next fat item (cluster)

  name: string
  color: string

  constructor(offset: number, nextCluster: number | FatItemState, name: string, color: string) {
    this.offset = offset
    this.nextCluster = nextCluster
    this.name = name
    this.color = color
  }

  markAsEndOfFile() {
    this.nextCluster = FatItemState.END_OF_CLUSTER
  }

  setState(nextCluser: number | FatItemState, name: string, color: string) {
    this.nextCluster = nextCluser
    this.name = name
    this.color = color
  }
}
