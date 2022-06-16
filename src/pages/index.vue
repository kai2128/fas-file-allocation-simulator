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
      <FatTable></FatTable>
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
