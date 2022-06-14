import { TestContext, beforeEach, describe, expect, it } from 'vitest'
import { Disk } from '~/libs/volume/disk'

function buf(str: string): Buffer {
  return Buffer.from(str.replace(/[\s\n\r]+/g, ''), 'binary')
}

const setupHexString = () => {
  const hexString = `
      F0 FF FF 0F FF FF FF 0F FF FF FF 0F 04 00 00 00
      05 00 00 00 06 00 00 00 07 00 00 00 08 00 00 00
      FF FF FF 0F 0A 00 00 00 14 00 00 00 0C 00 00 00
      0D 00 00 00 0E 00 00 00 0F 00 00 00 10 00 00 00
      11 00 00 00 FF FF FF 0F 00 00 00 00 FF FF FF 0F
      15 00 00 00 16 00 00 00 19 00 00 00 F7 FF FF 0F
      F7 FF FF 0F 1A 00 00 00 FF FF FF 0F 00 00 00 00
      00 00 00 00 F7 FF FF 0F 00 00 00 00 00 00 00 00
    `
  const buffer = buf(hexString)
  const disk = new Disk(hexString)
  return { buffer, disk }
}

describe.skip('Implemented disk compare to node.js buffer', () => {
  it('should equal in initialization (created from hex string)', () => {
    const { buffer, disk } = setupHexString()
    expect(disk.toString()).toBe(buffer.toString())
  })

  it('should equal in initialization (created from size)', () => {
    const buffer = Buffer.alloc(5)
    const disk = new Disk(5)
    expect(disk.toString()).toBe(buffer.toString('hex'))
  })

  it('should equal in access by address', () => {
    const { buffer, disk } = setupHexString()
    let a = disk.read()
    let b = buffer.readUInt16LE(0)
    expect(a).toBe(0xF0FF)
  })
})

