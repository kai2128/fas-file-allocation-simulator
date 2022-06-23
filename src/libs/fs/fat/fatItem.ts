export enum FatItemState {
  END_OF_CLUSTER = 0x0FFFFFF8,
  BAD_CLUSTER = 0x0FFFFFF7,
  RESERVED_CLUSTER = 0x0FFFFFF0,
  FREE_CLUSTER = 0x0000000,
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

  setEndState(name: string, color: string) {
    this.nextCluster = FatItemState.END_OF_CLUSTER
    this.name = name
    this.color = color
  }
}
