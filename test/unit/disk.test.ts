import { describe, expect, test } from 'vitest'
import { BlockColor, Disk } from '~/libs/volume/disk'

const testData = { data: 'test write', used: true, color: '#ff0000', reserved: false, free: false }
const reservedData = { data: 'test write', used: false, color: BlockColor.reserved, reserved: true, free: false }

describe('Disk unit test', () => {
  test('setup disk', () => {
    const disk = new Disk(5)
    expect(disk.units.length).toBe(5)
    disk.units.forEach((unit, i) => {
      expect(unit.offset).toBe(i)
      expect(unit.state.color).toBe('#ffffff')
      expect(unit.state.free).toBe(true)
      expect(unit.state.used).toBe(false)
      expect(unit.state.reserved).toBe(false)
      expect(unit.state.data).toMatchObject({})
    })
  })

  test('write to disk and read from disk', () => {
    const disk = new Disk(5)
    disk.writeUnit(0, testData)
    expect(disk.readUnit(0).state).toMatchObject(testData)
    // check if other disk block is free
    for (let i = 1; i < 5; i++)
      expect(disk.readUnit(i).state.free).toBe(true)
  })

  test('set disk blocks as used', () => {
    const disk = new Disk(5)
    const from = 0
    const until = 2
    disk.setUsedList(from, until, testData.color, testData.data)

    // check disk block 0, 1, 2 is written with test data
    expect(disk.read(0, 2).map(unit => unit.state)).toMatchObject([testData, testData, testData])
  })

  test('set disk blocks as free', () => {
    const disk = new Disk(5)
    // first write some data to disk
    disk.units.forEach((unit) => {
      unit.state = testData
    })

    disk.setFreeList(0, 4)
    disk.units.forEach((unit) => {
      expect(unit.state.color).toBe('#ffffff')
      expect(unit.state.free).toBe(true)
      expect(unit.state.used).toBe(false)
      expect(unit.state.reserved).toBe(false)
      expect(unit.state.data).toMatchObject({})
    })
  })

  test('set disk blocks as reserved', () => {
    const disk = new Disk(5)
    disk.units.forEach((unit) => {
      unit.state = reservedData
    })

    disk.units.forEach((unit) => {
      expect(unit.state.color).toBe(BlockColor.reserved)
      expect(unit.state.free).toBe(false)
      expect(unit.state.used).toBe(false)
      expect(unit.state.reserved).toBe(true)
      expect(unit.state.data).toMatchObject({})
    })
  })
})
