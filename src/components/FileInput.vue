<script setup lang="ts">
import { inputs } from '~/composables/state'
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
          <option value="create">Create</option>
          <option value="read">Read</option>
          <option value="delete">Delete</option>
          <option value="append">Append</option>
          <option value="write">Write</option>
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
