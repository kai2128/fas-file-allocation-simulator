<script setup lang="ts">
import { disk } from '~/composables/state'
import { Disk } from '~/libs/volume/disk'
</script>

<template>
  <section class="area-[blocks]">
    <h1 class="font-bold text-2xl">
      Volume Blocks
    </h1>
    <div class="w-full">
      <div class="flex justify-end items-center gap-x-3 mb-10">
        <div class="reserved">
          Reserved
        </div>
        <div class="free">
          Free
        </div>
      </div>
      <div class="disk relative flex justify-center overflow-x-visible">
        <div class="absolute" transform="translate-y-[-1.5rem] translate-x-[1.61rem]">
          <div
            v-if="disk.units?.length !== 0 && disk instanceof Disk"
            flex="~ gap-x-7.2"
            transform="translate-x-[-0.58rem]"
          >
            <div v-for="num in Array.from(Array(10).keys())" :key="num" :class="{ 'translate-x--2': num === 9, 'translate-x--0.6': num === 8 }">
              {{ num + 1 }}
            </div>
          </div>
        </div>
        <div
          id="disk-blocks" ref="diskBlocksEl"
          class="grid grid-cols-10 gap-x-2 gap-y-3 h-23rem min-w-420px pl-10 pr-2 scroll-smooth"
          scrollbar="~ rounded hover:thumb-color-#55626f transition-color"
        >
          <div v-if="!disk.units" col-span-full text="center gray-300">
            Disk not formatted
          </div>
          <div
            v-for="(block, i) in (disk.units)" v-else :id="block.offset.toString()" :key="block.offset"
            class="border-3 rounded border-#e9e9e9 h-30px w-30px transition-colors duration-1000"
            :class="[{ relative: !(i % 10) }]" :style="{ backgroundColor: block.state.color }"
          >
            <div v-if="!(i % 10)" absolute transform="translate-x-[-2.5rem]" v-text="i" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>

</style>
