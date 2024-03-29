import type { Ref } from 'vue'
import { isEmpty, last } from 'lodash-es'
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

export const inputs = useStorage('inputs', {
  fileSystemSelected: '',
  diskSize: '',

  fileName: '',
  fileAction: '',
  fileSize: '',

  fileSelected: '',
},
) as Ref<Inputs>

export interface HistorySteps {
  action: string
  fileSystemSelected?: string
  diskSize?: string
  fileName?: string
  fileSize?: number | string
}

export const stepsHistory = useStorage('steps', []) as Ref<HistorySteps[]>
export function checkDefragmentationStep() {
  const step = last(stepsHistory.value)
  if (step?.action === 'defragmentation')
    throw new Error('Defragmentation is performed')
}
export function addDefragmentationStep() {
  stepsHistory.value.push({
    action: 'defragmentation',
  })
}
export function addFormatStep() {
  const formatSteps = {
    action: 'format',
    fileSystemSelected: inputs.value.fileSystemSelected,
    diskSize: inputs.value.diskSize,
  }
  stepsHistory.value.length = 0
  stepsHistory.value.push(formatSteps)
}
export function addFileActionStep() {
  const fileActionSteps = {
    action: inputs.value.fileAction,
    fileName: inputs.value.fileName,
    fileSize: inputs.value.fileSize,
  }
  stepsHistory.value.push(fileActionSteps)
}
export function revertPreviousActionStep() {
  stepsHistory.value.pop()
}

export function checkValidSteps(step: HistorySteps) {
  if (step.action == null)
    throw new Error('Invalid history steps.')

  if (step.action === 'format') {
    if (!['FAT', 'ext4'].includes(step.fileSystemSelected!))
      throw new Error('Invalid steps.')
    if (!Number(step.diskSize))
      throw new Error('Invalid disk size.')
    if (Number(step.diskSize) > 500)
      throw new Error('Maximum supported disk size is 500.')
  }
  else if (['fs_create', 'fs_delete', 'fs_read', 'fs_write', 'fs_append'].includes(step.action)) {
    if (!Number(step.fileSize))
      throw new Error('Invalid file size.')

    if (!step.fileName)
      throw new Error('Invalid file name.')
  }
  else if (step.action !== 'defragmentation') {
    throw new Error('Invalid actions.')
  }
}

export function parseImportSteps(steps: HistorySteps[]) {
  if (steps.length === 0 || steps == null) {
    notify('Imported steps is empty.', 'INFO')
    return
  }

  if (steps[0].action !== 'format') {
    notify('Imported steps are invalid, failed to import.', 'ERROR')
    return
  }

  for (let index = 0; index < steps.length; index++) {
    const element = steps[index]
    try {
      const { action, fileSystemSelected, diskSize, fileName, fileSize } = element
      if (action === 'format') {
        inputs.value.fileSystemSelected = fileSystemSelected!
        inputs.value.diskSize = diskSize!
        createAndFormatDisk(Number(diskSize), fileSystemSelected!)
      }
      else if (action === 'defragmentation') {
        try {
          checkDefragmentationStep()
          if (fs.value !== null)
            fs.value.fs_defragmentation()
        }
        catch {
          continue
        }
      }
      else if (['fs_append', 'fs_read', 'fs_write', 'fs_delete', 'fs_create'].includes(action)) {
        inputs.value.fileAction = action
        inputs.value.fileName = fileName!
        inputs.value.fileSize = fileSize!
        fs.value[inputs.value.fileAction](inputs.value.fileName, fileSize)
      }
      else {
        notify(`Unknown action ${action}`, 'ERROR')
      }
    }
    catch (err) {
      log(err, 'ERROR')
      break
    }
  }
  stepsHistory.value = steps
}

export const disk = ref({}) as Ref<Disk>
export const fs = ref({}) as Ref<FSApi>

export function createAndFormatDisk(size: number, fsType: string) {
  if (size > 500) {
    throw new Error('Maximum supported disk size is 500.')
    notify('Maximum supported disk size is 500. Please set a smaller disk size.', 'ERROR')
  }

  disk.value = new Disk(size)

  switch (fsType) {
    case 'FAT':
      fs.value = FatFs.format(disk.value)
      break
    case 'ext4':
      fs.value = Ext4.format(disk.value)
      break
  }
  addFormatStep()
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

if (!isEmpty(stepsHistory.value))
  parseImportSteps([...stepsHistory.value])
