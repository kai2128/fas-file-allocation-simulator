<script setup lang="ts">
useHead({
  title: 'FAS File Allocation Simulator',
  meta: [
    { name: 'description', content: 'Simple file allocation simulator' }],
  link: [
    {
      rel: 'icon',
      type: 'image/svg+xml',
      href: computed(() => preferredDark.value ? '/fas-file-allocation-simulator/favicon-dark.svg' : '/fas-file-allocation-simulator/favicon.svg'),
    },
  ],
},
)
</script>

<template>
  <main font-inter>
    <RouterView />
    <Notification />
    <ScreenAlert />
    <ExportModal></ExportModal>
    <ImportModal></ImportModal>
  </main>
</template>
