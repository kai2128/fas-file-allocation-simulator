<script setup lang="ts">
import { resetActionsState } from '~/composables/actions'
import { createAndFormatDisk, inputs } from '~/composables/state'
import { notify } from '~/composables/useNotify'
import { animating } from '~/composables/animations'

const formatDisk = () => {
  if (!inputs.value.fileSystemSelected) {
    notify('Please select a file system', 'ERROR')
    return
  }
  if (!inputs.value.diskSize || isNaN(Number(inputs.value.diskSize))) {
    notify('Please specify a disk size', 'ERROR')
    return
  }

  if (Number(inputs.value.diskSize) < 3) {
    notify('Please specify larger disk size', 'ERROR')
    return
  }

  if (inputs.value.fileSystemSelected === 'FAT' && Number(inputs.value.diskSize) < 8) {
    notify('FAT file system requires a disk size of at least 8', 'ERROR')
    return
  }

  resetActionsState()
  setState.reset()
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
    <section bg="#f3f7fc" class="px-16 h-full flex items-center ml-24vw">
      <div class="flex items-center gap-x-5" data-tour="disk-input">
        <label flex="~ col">
          <span font-bold>File system</span>
          <select v-model="inputs.fileSystemSelected" rounded px-3 py-1 :disabled="animating">
            <option value="FAT">FAT</option>
            <option value="ext4">ext4</option>
          </select>
        </label>
        <label flex="~ col">
          <span font-bold>Disk size:</span>
          <input v-model="inputs.diskSize" type="text" rounded px-3 py-1 w-20 :disabled="animating">
        </label>
        <button btn class="group transition-all" border="2 #cfd8db" :disabled="animating" @click="formatDisk">
          <div
            i-ant-design:format-painter-filled text="#cccccc" :disabled="animating"
            class="group-hover:text-cool-gray-700 mr-1 group-hover:disabled:text-cool-gray-300"
          /> Format
        </button>
      </div>
    </section>
    <section class="flex">
      <button class="icon-link text-5" @click="useTour().start()">
        Guide
        <div i-mdi:help-circle inline-block align-text-top />
      </button>
      <RouterLink to="/docs" class="h-full flex items-center justify-center px-10" bg="#d7e3f4" data-tour="docs">
        <div class="icon-link items-center text-5" flex="~" bg="#d7e3f4">
          Docs
        </div>
      </RouterLink>
    </section>
  </nav>
</template>

<style scoped>
</style>
