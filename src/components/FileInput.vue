<script setup lang="ts">
import { random, sample } from 'lodash-es'
import { animateState, initAnimation } from '~/composables/animations'
import { files, fs, inputs } from '~/composables/state'
import { fatAnimation } from '~/libs/fs/fat/fatAnimation'

const generateInputHandler = () => {
  inputs.value.fileAction = sample(['fs_create', 'fs_delete', 'fs_append', 'fs_write', 'fs_read'])!
  if (files.value.length <= 0)
    inputs.value.fileAction = 'fs_create'
  inputs.value.fileAction === 'fs_create'
    ? inputs.value.fileName = `${(Math.random() + 1).toString(36).substring(7)}.txt`
    : inputs.value.fileName = sample(files.value)!.data.name

  if (['fs_create', 'fs_append', 'fs_write'].includes(inputs.value.fileAction))
    inputs.value.fileSize = Math.floor(1 + Math.random() * disk.value.getDiskInfo().free)
}

const executeHandler = () => {
  const fileSize = Number(inputs.value.fileSize)

  if (fs.value.name == null) {
    notify('Please format the disk first', 'ERROR')
    return
  }

  if (!inputs.value.fileName) {
    notify('Please specify a file name', 'ERROR')
    return
  }

  if (!inputs.value.fileAction) {
    notify('Please select a file action', 'ERROR')
    return
  }

  if (['fs_create', 'fs_append', 'fs_write'].includes(inputs.value.fileAction)) {
    if (!inputs.value.fileSize) {
      notify('Please enter a file size', 'ERROR')
      return
    }
    if (isNaN(fileSize)) {
      notify('Please enter a valid file size', 'ERROR')
      return
    }
  }

  // TODO: animation interval, cancel, skip, disable, manual control.
  setActions(inputs.value.fileAction.substring(3))
  initAnimation()
  startAnimation()
  try {
    fs.value.fs_create(inputs.value.fileName, fileSize)
    // fs.value[inputs.value.fileAction](inputs.value.fileName, fileSize)
  }
  catch (err) {
    notify(err.message, 'ERROR')
    log(err.message)
  }
}
</script>

<template>
  <section class="area-[input]">
    <div class="flex justify-between">
      <h1 class="font-bold text-2xl">
        Input
      </h1>
      <button i-mdi:cogs class="icon-btn" @click="generateInputHandler" />
    </div>
    <div class="grid grid-cols-2 gap-y-4 gap-x-5 mt-5 w-[clamp(19rem,22rem,35rem)] mx-a">
      <label class="flex items-center gap-x-2 col-span-2">
        <span>Name</span>
        <input v-model="inputs.fileName" type="text" class="rounded px-1 py-1 w-full ml-1.5" border="2px cool-gray-200">
      </label>
      <label class="flex items-center gap-x-2">

        <span>Action</span>
        <select v-model="inputs.fileAction" rounded px-1 py-1 w-full border="2px cool-gray-200">
          <option value="fs_create">Create</option>
          <option value="fs_read">Read</option>
          <option value="fs_delete">Delete</option>
          <option value="fs_append">Append</option>
          <option value="fs_write">Write</option>
        </select>
      </label>
      <label class="flex items-center gap-x-2">
        <span>Size</span>
        <input
          v-model="inputs.fileSize" :disabled="inputs.fileAction == 'read' || inputs.fileAction == 'delete'"
          type="text" class="rounded px-1 py-1 w-full" border="2px cool-gray-200"
        >
      </label>
      <button class="col-span-2 btn justify-self-center text-center" @click="executeHandler">
        Execute
      </button>
    </div>
  </section>
</template>

<style scoped>

</style>
