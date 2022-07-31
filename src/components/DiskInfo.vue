<script setup lang="ts">
import { disk, fs } from '~/composables/state'
const diskInfo = $computed(() => disk.value.getDiskInfo())
const diskGraph = $computed(() => disk.value.generateDiskGraph())
</script>

<template>
  <section class="area-[info]" data-tour="disk-info">
    <h1 class="font-bold text-2xl">
      Disk Info
      <span text="lg" font="normal">
        -
        {{ fs?.name }}
      </span>
    </h1>
    <div v-if="fs?.name == null" text="center gray-300" font="300">
      Disk not formatted
    </div>
    <div v-else>
      <div mt3 ml2 grid="~ cols-[repeat(2,minmax(0,max-content))] gap-x-10">
        <div font="bold">
          Total
        </div>
        <div>{{ diskInfo.total }}</div>
        <div font="bold" class="free">
          Free
        </div>
        <div>{{ diskInfo.free }}</div>
        <div font="bold" class="reserved">
          Reserved
        </div>
        <div>{{ diskInfo.reserved }}</div>
        <div font="bold">
          Used
        </div>
        <div>{{ diskInfo.used }}</div>
        <div font="bold">
          Fragmentation
        </div>
        <div>{{ diskInfo.fragmentation.toFixed(2) }} %</div>
      </div>
      <div mt="3" border="gray-200 2" h="2rem" class="flex">
        <div
          v-for="(block, i) in diskGraph" :key="i" class="h-full"
          :style="{ width: block.width, backgroundColor: block.color }"
        />
      </div>
    </div>
  </section>
</template>

<style>
</style>
