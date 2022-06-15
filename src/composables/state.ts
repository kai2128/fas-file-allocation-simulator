import type { Ref } from 'vue'
import type { FSApi } from './../libs/fs/types'
import { Disk } from '~/libs/volume/disk'
import { FatFs } from '~/libs/fs/fat'

export interface State {
  fs?: FSApi
  disk?: Disk
}

export interface Inputs {
  fileSystemSelected: string
  diskSize: string

  fileName: string
  fileAction: string
  fileSize: string

  fileSelected: string
}

export const inputs = ref({
  fileSystemSelected: '',
  diskSize: '',

  fileName: '',
  fileAction: '',
  fileSize: '',

  fileSelected: '',
},
) as Ref<Inputs>

export const disk = ref({}) as Ref<Disk>
export const fs = ref({}) as Ref<FSApi>

export function createAndFormatDisk(size: number, fsType: string) {
  disk.value = new Disk(size)

  switch (fsType) {
    case 'FAT':
      fs.value = FatFs.format(disk.value)
  }
}
