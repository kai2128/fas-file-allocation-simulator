import { filter, find, findIndex, take } from 'lodash-es'
import { FatItem, FatItemState } from './fatItem'
import { BlockColor } from '~/libs/volume'

export class FatTable {
  table: Array<FatItem>

  constructor(fatTableLength: number, dataSectorStartingCluster: number) {
    this.table = new Array(fatTableLength).fill({}).map((v, i) => {
      return new FatItem(i, i + dataSectorStartingCluster, FatItemState.FREE_CLUSTER, 'free', BlockColor.free)
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

  getNextFreeClusterItem() {
    return find(this.table, item => item.nextCluster === FatItemState.FREE_CLUSTER)
  }
}

