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
</script>

<template>
  <main font-inter>
    <RouterView />
    <Notification />
    <ScreenAlert />
  </main>
</template>
