<script setup lang="ts">

</script>

<template>
  <section class="!pb-0 area-[log]" flex="~ col">
    <div class="flex justify-between">
      <h1 class="font-bold text-2xl">
        Log
      </h1>
      <button i-ic:twotone-format-clear class="icon-btn" @click="clearLogs" />
    </div>

    <div
      ref="logEl"
      class="bg-gray-200 before:content-[Peusdocode] w-full flex-1 overflow-auto px-1 max-h-220 scroll-smooth"
      font="mono" text="sm" scrollbar="~ rounded hover:thumb-color-#55626f transition-color"
    >
      <p v-for="(logRecord, i) in logs" :key="i">
        <span>
          {{ dayjs(logRecord.time).format('hh:mm:ss A') }} [{{ logRecord.type }}]:
        </span>
        <span>
          {{ logRecord.msg }}
        </span>
      </p>
    </div>
  </section>
</template>

<style>
</style>
