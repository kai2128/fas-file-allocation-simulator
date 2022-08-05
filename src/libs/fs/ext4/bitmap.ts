export class Bitmap {
  state: 0 | 1
  get used() {
    return this.state === 1
  }

  get free() {
    return this.state === 0
  }

  setUsed() {
    this.state = 1
  }

  setFree() {
    this.state = 0
  }

  constructor(
    public index: number,
  ) {
    this.state = 0
  }
}
