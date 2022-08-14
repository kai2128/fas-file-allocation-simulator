<script setup lang="ts">
const { width } = useWindowSize()
const dismissed = ref(false)
</script>

<template>
  <teleport v-if="!dismissed && (width < 1200)" to="#modal">
    <div class="absolute inset-0 w-screen h-screen z-100 items-center justify-center" bg="white/80" flex="~">
      <div text="8" class="px-5 py-10" sm="w-130" md="w-150" lg="w-150" bg="white">
        Device with screen size smaller than 1200x720 is not supported for this application.
        <button class="btn mx-a" text="5" @click="dismissed = true">
          Dismiss
        </button>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
</style>
