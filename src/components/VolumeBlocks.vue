<script setup lang="ts">
import { last } from 'lodash-es'
import { disk } from '~/composables/state'
import { Disk } from '~/libs/volume/disk'
import { actionsFile, renderStateClass } from '~/composables/actions'

watchEffect(() => {
  const selectedBlockId = last(actionsState.value.block?.selected)
  const flashBlockId = last(actionsState.value.block?.flash)
  if (flashBlockId !== null) {
    requestAnimationFrame(() => {
      document.getElementById(`block-${selectedBlockId}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    })
  }

  else if (selectedBlockId !== null) {
    requestAnimationFrame(() => {
      document.getElementById(`block-${selectedBlockId}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    })
  }
})
</script>

<template>
  <section class="area-[blocks]">
    <h1 class="font-bold text-2xl">
      Volume Blocks
    </h1>
    <div class="w-full">
      <FileBlocks v-if="actionsFile" />
      <div v-else class="flex justify-end items-center gap-x-3">
        <div class="reserved">
          Reserved
        </div>
        <div class="free">
          Free
        </div>
      </div>
      <div class="disk relative flex justify-center overflow-x-visible mt-7">
        <div class="absolute" transform="translate-y-[-1.5rem] translate-x-[1.61rem]">
          <div
            v-if="disk.units?.length !== 0 && disk instanceof Disk" flex="~ gap-x-7.2"
            transform="translate-x-[-0.58rem]"
          >
            <div
              v-for="num in Array.from(Array(10).keys())" :key="num"
              :class="{ 'translate-x--2': num === 9, 'translate-x--0.6': num === 8 }"
            >
              {{ num }}
            </div>
          </div>
        </div>
        <div
          id="disk-blocks" ref="diskBlocksEl"
          class="grid grid-cols-10 gap-x-2 gap-y-3 max-h-19rem min-w-420px pl-10 pr-2 scroll-smooth"
          scrollbar="~ rounded hover:thumb-color-#55626f transition-color"
        >
          <div v-if="!disk.units" col-span-full text="center gray-300">
            Disk not formatted
          </div>
          <div
            v-for="(block, i) in disk.units" v-else :id="`block-${block.offset.toString()}`" :key="block.offset"
            v-bg-color="block.state.color" class="blocks"
            :class="[{ relative: !(i % 10), ...renderStateClass(i, 'block') }]"
          >
            <div v-if="!(i % 10)" absolute transform="translate-x-[-2.5rem]" v-text="i" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.blocks {
  --at-apply: border-3 rounded border-#e9e9e9 h-30px w-30px transition-all
    duration-1000;
}

.selected::before{
  /* --at-apply: content-['▼'] text-black/50 absolute inset-0 translate-x-1 translate-y--3 */
}
</style>
