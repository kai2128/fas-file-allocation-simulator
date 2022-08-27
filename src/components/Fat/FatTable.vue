<script setup lang="ts">
import { Popper } from 'vue-use-popperjs'
import { last } from 'lodash-es'
import { fs } from '~/composables/state'
import type { FatFs } from '~/libs/fs/fat'
import { FatItemState } from '~/libs/fs/fat'
import { actionsState } from '~/composables/actions'

const fatTable = $computed(() => { return ((fs.value) as FatFs)?.fatTable?.table || null })

function fatClusterToString(nextCluster: number) {
  switch (nextCluster) {
    case FatItemState.END_OF_CLUSTER:
      return 'END'
    case 0xF8FFF0F:
    case 0xFFFFFFF:
      return 'Reserved'
    default:
      return nextCluster
  }
}

watchEffect(() => {
  const selectedFatId = last(actionsState.value.fat?.selected)
  requestAnimationFrame(() => {
    document.getElementById(`fat-${selectedFatId}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  })
})

watchEffect(() => {
  const flashFatId = last(actionsState.value.fat?.flash)
  requestAnimationFrame(() => {
    document.getElementById(`fat-${flashFatId}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  })
})
</script>

<template>
  <section class="area-[fs]" data-tour="fs-component">
    <h1 class="font-bold text-xl">
      File Allocation Table
    </h1>
    <div ref="fatEl" scrollbar="~ rounded hover:thumb-color-#55626f transition-color" class=" px3 mx1 max-h-420px">
      <table class="w-full">
        <thead>
          <tr class="text-gray-400">
            <td text-xs>
              Index
            </td>
            <td text-sm>
              Block No.
            </td>
            <td>Value</td>
            <td>Label</td>
          </tr>
        </thead>
        <tbody data-test="fat-table">
          <tr v-if="fatTable == null" class="border-b border-b-gray-300">
            <td text="gray/50 center" colspan="4">
              -
            </td>
          </tr>
          <tr
            v-for="fatItem, idx of fatTable" v-else :id="`fat-${idx}`" :key="fatItem.offset"
            hover="bg-blue-gray-200/50 cursor-default" border="b gray2" :class="{ ...renderStateClass(idx, 'fat') }"
            relative
          >
            <td text="gray5">
              {{ idx }}
            </td>
            <td>
              {{ fatItem.offset }}
            </td>
            <td class="relative fat-next-cluster">
              {{ fatClusterToString(fatItem.nextCluster) }}
              <div class=" absolute inset-0 hidden">
                <div class="tooltips relative" :class="fatItem.index === fatTable.length - 1 ? 'bottom-10' : 'top-6'">
                  {{ fatItem.name }}
                </div>
              </div>
            </td>
            <td>
              <div v-bg-color="fatItem.color" border="2px gray-1" class="mx-a h-0.75rem w-0.75rem rounded-full" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style>
.tooltips {
  --at-apply: inline-block bg-white shadow-md rounded text-sm px2 py2 z-10 max-w-25 of-hidden text-ellipsis
}
.fat-next-cluster:hover > div {
  display: block !important;
}
</style>

<style scoped>
.selected {
  --at-apply: bg-gray/20
}
</style>
