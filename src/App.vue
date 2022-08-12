<script setup lang="ts">
useHead({
  title: 'FAS File Allocation Simulator',
  meta: [
    { name: 'description', content: 'Simple file allocation simulator' }],
  link: [
    {
      rel: 'icon',
      type: 'image/svg+xml',
      href: computed(() => preferredDark.value ? '/favicon-dark.svg' : '/favicon.svg'),
    },
  ],
},
)
if (localStorage.getItem('steps') == null || localStorage.getItem('steps')!.length <= 2)
  notify('To start the simulation, select a file system and enter disk size then click on "Format" button then enter some input in Input section. For more information, press on the "Guide" or "Docs" button.', 'INFO', 15000)
</script>

<template>
  <main font-inter>
    <RouterView />
    <Notification />
    <ExportModal />
    <ImportModal />
  </main>
  <ScreenAlert />
</template>
