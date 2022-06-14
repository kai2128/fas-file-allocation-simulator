export enum Entry {
  SIZE = 32,
  TYPE = 0,
  NAME = 1,
  READONLY = 0x01,
  HIDDEN = 0x02,
  SYSTEM = 0x04,
  VOLUME_LABEL = 0x08,
  LFN_FRAGMENT = 0x0F,
  DIRECTORY = 0x10,
  ARCHIVE = 0x20,
  USER = 0x27,
  DEVICE = 0x40,
  RESERVED = 0x80,
}

export function parseFATEntry(buffer: Buffer, offset = 0) {
  const entry = {
    name: buffer.toString('binary', offset + Entry.NAME, offset + Entry.NAME + 8),
    type: buffer.readUInt8(offset + Entry.TYPE),
    size: buffer.readUInt32LE(offset + Entry.SIZE),
    readonly: buffer.readUInt8(offset + Entry.READONLY) === 1,
    hidden: buffer.readUInt8(offset + Entry.HIDDEN) === 1,
    system: buffer.readUInt8(offset + Entry.SYSTEM) === 1,
    volumeLabel: buffer.readUInt8(offset + Entry.VOLUME_LABEL) === 1,
    lfnFragment: buffer.readUInt8(offset + Entry.LFN_FRAGMENT) === 1,
    directory: buffer.readUInt8(offset + Entry.DIRECTORY) === 1,
    archive: buffer.readUInt8(offset + Entry.ARCHIVE) === 1,
    user: buffer.readUInt8(offset + Entry.USER) === 1,
    device: buffer.readUInt8(offset + Entry.DEVICE) === 1,
    reserved: buffer.readUInt8(offset + Entry.RESERVED) === 1,
  }
  return entry
}
