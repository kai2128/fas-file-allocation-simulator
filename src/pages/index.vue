<script setup lang="ts">
import FatTable from '~/components/Fat/FatTable.vue'
import Ext4Component from '~/components/Ext4/Ext4Component.vue'

const fsComponent = $computed(() => {
  switch (fs.value.name) {
    case 'FAT':
      return FatTable
    case 'ext4':
      return Ext4Component
    default:
      return FatTable
  }
})
</script>

<template>
  <Header />
  <div class="px-20 py-10">
    <div id="grid-container" class="lt-2xl:(scale-95 transform-origin-t) lt-xl:(scale-92 transform-origin-t translate-x--15)">
      <FileInput />
      <FileExplorer />
      <component :is="fsComponent" />
      <VolumeBlocks />
      <Actions />
      <Log />
      <DiskInfo />
    </div>
  </div>
</template>

<style scoped>
#grid-container section {
  --at-apply: bg-white shadow-#CED8DC shadow-lg rounded-lg px-8 py-5 relative
}
</style>

<route lang="yaml">
meta:
  layout: home
</route>
