<script setup lang="ts">
const { y } = useScroll(window)
function scrollToTop() {
  window.scrollTo(0, 0)
}
</script>

<template>
  <main>
    <DocHeader />
    <RouterView />
  </main>
  <div v-if="y !== 0" class="fixed bottom-0 left-0">
    <div class="my-15vh bg-white p-2 pl-10 lt-lg:pl-4 icon-link opacity-100 text-5 shadow-lg hover:decoration-none" @click="scrollToTop()"
      lt-md="my-0 opacity-60"
    >
      <div class="i-mdi:arrow-up lt-lg:text-8" />
      <div class="lt-lg:hidden">
        Back to Top
      </div>
    </div>
  </div>
</template>
