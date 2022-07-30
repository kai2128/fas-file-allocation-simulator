<script setup lang="ts">
import Shepherd from 'shepherd.js'
const tour = new Shepherd.Tour({
  useModalOverlay: true,
  defaultStepOptions: {
    cancelText: 'Cancel',
    classes: 'shepherd-theme-arrows',
    scrollTo: true,
    showCancelLink: true,
    useModalOverlay: true,
  },
})
tour.addStep({
  title: 'Welcome to the Shepherd Tour',
  text: 'This tour will show you around the application.',
  buttons: [
    {
      text: 'Next',
      action: tour.next,
    },
  ],
})
tour.start()
</script>

<template>
  <Header />
  <div class="px-20 py-10">
    <div id="grid-container">
      <FileInput />
      <FileExplorer />
      <FatTable />
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
