<script setup lang="ts">
defineProps<{ isLocked: boolean; title: string }>()
defineEmits(['toggle'])
</script>

<template>
  <button flex="~" items="center" @click="$emit('toggle')" class="icon-btn" :class="{ 'text-cool-gray-800': isLocked }">
    <span v-if="isLocked" i-mdi:lock class="inline-block" />
    <span v-else i-mdi:lock-off-outline class="inline-block" />
    <span text="4" font="bold">{{ title }}</span>
  </button>
</template>

<style>
</style>
