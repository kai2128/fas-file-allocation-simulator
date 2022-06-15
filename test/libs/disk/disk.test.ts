import { describe, expect, it } from 'vitest'
import { Disk } from '~/libs/volume/disk'

describe('Disk', () => {
  it('test setup disk', () => {
    const disk = new Disk(5)
    expect(disk.units).toMatchInlineSnapshot(`
      [
        {
          "offset": 0,
          "state": {
            "color": "#ffffff",
            "data": {},
            "free": true,
            "reserved": false,
            "used": false,
          },
        },
        {
          "offset": 1,
          "state": {
            "color": "#ffffff",
            "data": {},
            "free": true,
            "reserved": false,
            "used": false,
          },
        },
        {
          "offset": 2,
          "state": {
            "color": "#ffffff",
            "data": {},
            "free": true,
            "reserved": false,
            "used": false,
          },
        },
        {
          "offset": 3,
          "state": {
            "color": "#ffffff",
            "data": {},
            "free": true,
            "reserved": false,
            "used": false,
          },
        },
        {
          "offset": 4,
          "state": {
            "color": "#ffffff",
            "data": {},
            "free": true,
            "reserved": false,
            "used": false,
          },
        },
      ]
    `)
  })

  it('test read write unit', () => {
    const disk = new Disk(5)
    disk.writeUnit(0, { free: false })
    expect(disk.read(0, 2)).toMatchInlineSnapshot(`
      [
        {
          "offset": 0,
          "state": {
            "free": false,
          },
        },
        {
          "offset": 1,
          "state": {
            "color": "#ffffff",
            "data": {},
            "free": true,
            "reserved": false,
            "used": false,
          },
        },
        {
          "offset": 2,
          "state": {
            "color": "#ffffff",
            "data": {},
            "free": true,
            "reserved": false,
            "used": false,
          },
        },
      ]
    `)

    disk.write(1, 4, { free: false })
    expect(disk.units).toMatchInlineSnapshot(`
      [
        {
          "offset": 0,
          "state": {
            "free": false,
          },
        },
        {
          "offset": 1,
          "state": {
            "free": false,
          },
        },
        {
          "offset": 2,
          "state": {
            "free": false,
          },
        },
        {
          "offset": 3,
          "state": {
            "free": false,
          },
        },
        {
          "offset": 4,
          "state": {
            "free": false,
          },
        },
      ]
    `)

    disk.setFree(1)
    expect(disk.units).toMatchInlineSnapshot(`
      [
        {
          "offset": 0,
          "state": {
            "free": false,
          },
        },
        {
          "offset": 1,
          "state": {
            "color": "#ffffff",
            "data": {},
            "free": true,
            "reserved": false,
            "used": false,
          },
        },
        {
          "offset": 2,
          "state": {
            "free": false,
          },
        },
        {
          "offset": 3,
          "state": {
            "free": false,
          },
        },
        {
          "offset": 4,
          "state": {
            "free": false,
          },
        },
      ]
    `)

    disk.setUsed(3, '#ff0000', { a: 1 })
    expect(disk.units).toMatchInlineSnapshot(`
      [
        {
          "offset": 0,
          "state": {
            "free": false,
          },
        },
        {
          "offset": 1,
          "state": {
            "color": "#ffffff",
            "data": {},
            "free": true,
            "reserved": false,
            "used": false,
          },
        },
        {
          "offset": 2,
          "state": {
            "free": false,
          },
        },
        {
          "offset": 3,
          "state": {
            "color": "#ff0000",
            "data": {
              "a": 1,
            },
            "free": false,
            "reserved": false,
            "used": true,
          },
        },
        {
          "offset": 4,
          "state": {
            "free": false,
          },
        },
      ]
    `)

    disk.setUsedList(0, 2, '#ff0000', { a: 1 })
    expect(disk.units).toMatchInlineSnapshot(`
      [
        {
          "offset": 0,
          "state": {
            "color": "#ff0000",
            "data": {
              "a": 1,
            },
            "free": false,
            "reserved": false,
            "used": true,
          },
        },
        {
          "offset": 1,
          "state": {
            "color": "#ff0000",
            "data": {
              "a": 1,
            },
            "free": false,
            "reserved": false,
            "used": true,
          },
        },
        {
          "offset": 2,
          "state": {
            "color": "#ff0000",
            "data": {
              "a": 1,
            },
            "free": false,
            "reserved": false,
            "used": true,
          },
        },
        {
          "offset": 3,
          "state": {
            "color": "#ff0000",
            "data": {
              "a": 1,
            },
            "free": false,
            "reserved": false,
            "used": true,
          },
        },
        {
          "offset": 4,
          "state": {
            "free": false,
          },
        },
      ]
    `)

    disk.setFreeSize(0, 4)
    expect(disk.units).toMatchInlineSnapshot(`
      [
        {
          "offset": 0,
          "state": {
            "color": "#ffffff",
            "data": {},
            "free": true,
            "reserved": false,
            "used": false,
          },
        },
        {
          "offset": 1,
          "state": {
            "color": "#ffffff",
            "data": {},
            "free": true,
            "reserved": false,
            "used": false,
          },
        },
        {
          "offset": 2,
          "state": {
            "color": "#ffffff",
            "data": {},
            "free": true,
            "reserved": false,
            "used": false,
          },
        },
        {
          "offset": 3,
          "state": {
            "color": "#ffffff",
            "data": {},
            "free": true,
            "reserved": false,
            "used": false,
          },
        },
        {
          "offset": 4,
          "state": {
            "color": "#ffffff",
            "data": {},
            "free": true,
            "reserved": false,
            "used": false,
          },
        },
      ]
    `)
  })
})

