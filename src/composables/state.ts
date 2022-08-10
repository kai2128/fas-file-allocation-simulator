import type { Ref } from 'vue'
import type { FSApi } from './../libs/fs/types'
import { Disk } from '~/libs/volume/disk'
import { FatFs } from '~/libs/fs/fat'
import { Ext4 } from '~/libs/fs/ext4'

export interface State {
  fs?: FSApi
  disk?: Disk
}

export interface Inputs {
  fileSystemSelected: string
  diskSize: string

  fileName: string
  fileAction: string
  fileSize: number | string

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
      break
    case 'ext4':
      fs.value = Ext4.format(disk.value)
      break
  }
}

export const files = computed(() => {
  return fs.value.fs_files
})

interface AnimationInput {
  interval: number
  cancel: boolean
  skip: boolean
  disabled: boolean
  manualMode: boolean
}

export const aniInput = ref({
  interval: 1000,
  cancel: false,
  skip: false, // skip animation straight complete the file action
  disabled: false, // disable animation
  manualMode: false, // control animation manually
}) as Ref<AnimationInput>

export const toggleAniInput = {
  cancel: (bool?: boolean) => { typeof bool == 'boolean' ? aniInput.value.cancel = bool : aniInput.value.cancel = !aniInput.value.cancel },
  skip: (bool?: boolean) => { typeof bool == 'boolean' ? aniInput.value.skip = bool : aniInput.value.skip = !aniInput.value.skip },
  disabled: (bool?: boolean) => { typeof bool == 'boolean' ? aniInput.value.disabled = bool : aniInput.value.disabled = !aniInput.value.disabled },
  manualMode: (bool?: boolean) => { typeof bool == 'boolean' ? aniInput.value.manualMode = bool : aniInput.value.manualMode = !aniInput.value.manualMode },
}
