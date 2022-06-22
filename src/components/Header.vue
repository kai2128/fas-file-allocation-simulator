<script setup lang="ts">
import { notify } from '~/composables/useNotify'
import { createAndFormatDisk, disk, fs, inputs } from '~/composables/state'
import { FatFs } from '~/libs/fs/fat'
import { Disk } from '~/libs/volume'
import { resetActionsState } from '~/composables/actions'

const formatDisk = () => {
  if (!inputs.value.fileSystemSelected) {
    notify('Please select a file system', 'ERROR')
    return
  }
  if (!inputs.value.diskSize || isNaN(Number(inputs.value.diskSize))) {
    notify('Please specify a disk size', 'ERROR')
    return
  }

  resetActionsState()
  createAndFormatDisk(Number(inputs.value.diskSize), inputs.value.fileSystemSelected)
}
</script>

<template>
  <nav bg="#d7e3f4" flex="~" class="items-center justify-between" h="100px">
    <section p="x-5" flex="~" gap-x-4 items="center">
      <div ml="5" text="4xl #bbbbbb" i-icon-park-outline:hard-disk />
      <div font="900" text="2xl">
        <div>
          <div>File Allocation</div>
          <div>Simulator</div>
        </div>
      </div>
    </section>
    <section bg="#f3f7fc" class="px-23 h-full flex items-center">
      <div class="flex items-center gap-x-5">
        <label flex="~ col">
          <span font-bold>File system</span>
          <select v-model="inputs.fileSystemSelected" rounded px-3 py-1>
            <option>FAT</option>
            <option disabled>ext4</option>
            <option disabled>btrfs</option>
          </select>
        </label>
        <label flex="~ col">
          <span font-bold>Disk size:</span>
          <input v-model="inputs.diskSize" type="text" rounded px-3 py-1>
        </label>
        <button btn class="group transition-all" border="2 #cfd8db" @click="formatDisk">
          <div i-ant-design:format-painter-filled text="#cccccc" class="group-hover:text-cool-gray-700 mr-1" /> Format
        </button>
      </div>
    </section>
  </nav>
</template>

<style scoped>

</style>
