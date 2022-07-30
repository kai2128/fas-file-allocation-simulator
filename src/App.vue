<script setup lang="ts">
// https://github.com/vueuse/head
// you can use this to manipulate the document head in any components,
// they will be rendered correctly in the html results with vite-ssg
useHead({
  title: 'FAS File Allocation Simulator',
  meta: [
    { name: 'description', content: 'Simple file allocation simulator' },
    // FIXME: TO DELETE after make sure no error
    // {
    //   name: 'theme-color',
    //   content: computed(() => isDark.value ? '#00aba9' : '#ffffff'),
    // },
  ],
  // link: [
  //   {
  //     rel: 'icon',
  //     type: 'image/svg+xml',
  //     href: computed(() => preferredDark.value ? '/favicon-dark.svg' : '/favicon.svg'),
  //   },
  // ],
})
</script>

<template>
  <main font-inter>
    <RouterView />
    <Notification />
  </main>
</template>
