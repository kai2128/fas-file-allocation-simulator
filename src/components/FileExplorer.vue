<script setup lang="ts">
import dayjs from 'dayjs'
import { files, fs } from '~/composables/state'

const selectFileHandler = (fileName: string) => {
  inputs.value.fileSelected = fileName
  inputs.value.fileName = fileName
  if (inputs.value.fileAction === 'create')
    inputs.value.fileAction = 'read'
}
</script>

<template>
  <section class="!pb-0 area-[files]" flex="~ col" h="15rem">
    <h1 class="font-bold text-2xl">
      Files
    </h1>
    <div bg="gray-200" class="px-1">
      <span v-if="fs?.name == null">-</span>
      <span v-else>/root</span>
    </div>
    <div
      class="bg-gray-200 before:content-[Peusdocode] overflow-auto flex-1 max-h-15rem px-1"
      scrollbar="~ rounded hover:thumb-color-#55626f transition-color"
    >
      <table w-full>
        <thead>
          <tr text="#828383" border-b="1px">
            <td>Name</td>
            <td>Size</td>
            <td>Time</td>
            <td>Label</td>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="file in files" :key="file.data.name" class="hover:bg-white/30 cursor-pointer"
            :class="[{ ...renderStateClass(file.data.name, 'dir') }]"
            @click="selectFileHandler(file.data.name)"
          >
            <td>{{ file.data.name }}</td>
            <td>{{ file.data.size }}</td>
            <td>{{ dayjs(file.data.dateCreated).format('hh:mm:ss A') }}</td>
            <td>
              <div
                border="2px gray-1" class="mx-a h-0.75rem w-0.75rem rounded-full"
                :style="{ backgroundColor: file.data.color }"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style>
</style>
