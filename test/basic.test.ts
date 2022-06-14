import { describe, expect, it } from 'vitest'
import { Disk } from '~/libs/volume/disk'
import { FatFs } from '~/libs/fs/fat'

describe('tests', () => {
  it('should works', () => {
    expect(1 + 1).toBe(2)
  })
})