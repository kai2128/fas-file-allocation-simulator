<script setup lang="ts">
import { inputs } from '~/composables/state'

function formatHandler() {
}
</script>

<template>
  <Header @format-disk="formatHandler" />
  <div class="px-20 py-10">
    <div id="grid-container">
      <FileInput />
      <FileExplorer />
      <section class="area-[fat]">
        <h1 class="font-bold text-2xl">
          File Allocation Table
        </h1>
        <table class="w-full">
          <thead>
            <tr class="text-gray-400">
              <td>Cluster No.</td>
              <td>Value</td>
              <td>File Name</td>
              <td>Label</td>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-b-gray-300">
              <td text="gray/50 center" colspan="4">
                -
              </td>
            </tr>
          </tbody>
        </table>
      </section>
      <VolumeBlocks />
      <Actions />
      <Log />
      <DiskInfo />
    </div>
  </div>
</template>

<style scoped>
#grid-container section{
  --at-apply: bg-white shadow-#CED8DC shadow-lg rounded-lg px-8 py-5 relative
}
</style>

<route lang="yaml">
meta:
  layout: home
</route>
