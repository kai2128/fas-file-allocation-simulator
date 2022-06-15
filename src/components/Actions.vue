<script setup lang="ts">
const action = {}
</script>

<template>
  <section class="area-[action]">
    <h1 class="font-bold text-2xl">
      Action
      <span text="sm" font="normal">
        {{ action.name || '-' }}
      </span>
    </h1>
    <div class="grid grid-cols-2 flex-1">
      <div text="sm">
        Steps
      </div>
      <div text="gray/70 xs" class="vertical-bottom">
        Pseudocode
      </div>
      <div
        class="prose" scrollbar="~ rounded hover:thumb-color-#55626f transition-color whitespace-pre-line"
        v-html="action.steps?.replace(/(?:\r\n|\r|\n)/g, '<br />')"
      />
      <div
        class="bg-gray-200 before:content-[Peusdocode] min-h-[7rem] font-mono"
        scrollbar="~ rounded hover:thumb-color-#55626f transition-color" v-html="action.code"
      />
    </div>
    <div />
    <div class="flex items-center justify-center " text="#3b5978 2xl" mt="5">
      <button i-fluent:fast-forward-16-filled transform="rotate-180" />
      <button i-ic:round-play-circle />
      <button i-fluent:fast-forward-16-filled />
    </div>
  </section>
</template>

<style scoped>

</style>
