export enum FatItemState {
  END_OF_CLUSTER = 0x0FFFFFF8,
  BAD_CLUSTER = 0x0FFFFFF7,
  RESERVED_CLUSTER = 0x0FFFFFF0,
  FREE_CLUSTER = 0x0000000,
}

export class FatItem {
  index: number
  offset: number // maps to disk sectors
  nextCluster: number | FatItemState // points to next fat item (cluster)

  name: string
  color: string

  constructor(index: number, offset: number, nextCluster: number | FatItemState, name: string, color: string) {
    this.index = index
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

  setEndState(name: string, color: string) {
    this.nextCluster = FatItemState.END_OF_CLUSTER
    this.name = name
    this.color = color
  }

  setFreeState() {
    this.nextCluster = FatItemState.FREE_CLUSTER
    this.name = ''
    this.color = BlockState.FREE_BLOCK
  }
}
