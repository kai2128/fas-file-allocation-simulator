<script setup lang="ts">
import { random, sample } from 'lodash-es'
import { animating, initAnimation } from '~/composables/animations'
import { addFileActionStep, files, fs, inputs, toggleAniInput } from '~/composables/state'

const { togglePref, showPref, generatePreferences } = useGeneratePreference()
const generateInputHandler = () => {
  const { lockAction, lockSize, lockName } = generatePreferences.value

  if (!lockAction)
    inputs.value.fileAction = sample(['fs_create', 'fs_delete', 'fs_append', 'fs_write', 'fs_read'])!

  if (files.value.length <= 0)
    inputs.value.fileAction = 'fs_create'

  if (!lockName) {
    inputs.value.fileAction === 'fs_create'
      ? inputs.value.fileName = `${(Math.random() + 1).toString(36).substring(7)}.txt`
      : inputs.value.fileName = sample(files.value)!.data.name
  }

  if (!lockSize) {
    if (['fs_create', 'fs_append', 'fs_write'].includes(inputs.value.fileAction))
      inputs.value.fileSize = Math.floor(1 + Math.random() * disk.value.getDiskInfo().free)
  }
}

const executeHandler = () => {
  if (animating.value) {
    toggleAniInput.skip()
    return
  }

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

  try {
    setActions(inputs.value.fileAction.substring(3))
    initAnimation()
    setState.reset()

    if (aniInput.value.disabled)
      fs.value[inputs.value.fileAction](inputs.value.fileName, fileSize)
    else
      startAnimation()
    addFileActionStep()
  }
  catch (err: Error) {
    notify(err.message, 'ERROR')
    log(err.message, 'ERROR')
  }
}
</script>

<template>
  <section class="area-[input]" data-tour="file-input">
    <div class="flex justify-between">
      <h1 class="font-bold text-2xl">
        Input
      </h1>
      <div flex="~">
        <button
          i-mdi:cogs class="icon-btn" title="Generate Random Input" :disabled="animating"
          @click="generateInputHandler"
        />
        <button title="Show generation preferences" class="icon-btn text-4 relative bottom-1" :class="{ 'i-fluent:caret-down-24-filled': !showPref, 'i-fluent:caret-up-24-filled': showPref }" @click="togglePref()" />
        <GenerationPreference />
      </div>
    </div>
    <div class="grid grid-cols-2 gap-y-4 gap-x-5 mt-5 w-[clamp(19rem,22rem,35rem)] mx-a">
      <label class="flex items-center gap-x-2 col-span-2">
        <span>Name</span>
        <input
          v-model="inputs.fileName" type="text" class="rounded px-1 py-1 w-full ml-1.5" border="2px cool-gray-200"
          :disabled="animating"
        >
      </label>
      <label class="flex items-center gap-x-2">
        <span>Action</span>
        <select v-model="inputs.fileAction" rounded px-1 py-1 w-full border="2px cool-gray-200" :disabled="animating">
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
          v-model="inputs.fileSize"
          :disabled="animating || inputs.fileAction === 'read' || inputs.fileAction === 'delete'" type="text"
          class="rounded px-1 py-1 w-full" border="2px cool-gray-200"
        >
      </label>
      <button
        v-if="!animating || aniInput.value.disabled" class="input-btn col-span-2" data-tour="file-input-button"
        @click="executeHandler"
      >
        Execute
      </button>
      <button v-if="animating && !aniInput.value.disabled" class="input-btn" @click="toggleAniInput.skip()">
        Skip
      </button>
      <button v-if="animating && !aniInput.value.disabled" class="input-btn" @click="toggleAniInput.cancel()">
        Cancel
      </button>
    </div>
  </section>
</template>

<style scoped>
</style>
