<script setup lang="ts">
const { width, height } = useWindowSize()
</script>

<template>
  <teleport v-if="width < 1200 || height < 720" to="#modal">
    <div class="absolute inset-0 w-screen h-screen z-100 items-center justify-center" bg="white/80" flex="~">
      <div text="8" class="px-5" sm="w-130" md="w-150" lg="w-150">
        Device with screen size smaller than 1200x720 is not supported for this application.
      </div>
    </div>
  </teleport>
</template>

<style scoped>
</style>
