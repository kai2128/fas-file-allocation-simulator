import randomColor from 'randomcolor'

export class DirectoryEntry {
  public color: string
  public dateCreated: number | Date
  public files: Array<DirectoryEntry>

  constructor(
    public name: string,
    public size: number,
    public firstClusterNumber?: number,
    public type: 'file' | 'directory' = 'file',
  ) {
    this.color = randomColor({ luminosity: 'light', seed: name })
    this.dateCreated = Date.now()
    if (type === 'directory')
      this.files = []
  }

  get entry() {
    return {
      name: this.name,
      size: this.size,
      type: this.type,
      dateCreated: this.dateCreated,
      color: this.color,
    }
  }
}
