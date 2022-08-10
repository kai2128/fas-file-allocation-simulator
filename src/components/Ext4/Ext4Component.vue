<script setup lang="ts">
import { last } from 'lodash-es'
import type { Ext4 } from '~/libs/fs/ext4'
import { animating } from '~/composables/animations'

const ext4fs = $computed(() => { return ((fs.value) as Ext4) })
const selectedFile = $computed(() => {
  return ext4fs.inodeTable.getInode(actions.value.state.selectedInode)
})

function setSelectedInodeHandler(inode: number) {
  if (!animating.value)
    actions.value.state.selectedInode = inode
}

watchEffect(() => {
  if (inputs.value.fileName) {
    const fileName = inputs.value.fileName
    try {
      const inode = ext4fs.getInodeFromDirectory(fileName)
      if (inode)
        actions.value.state.selectedInode = ext4fs.getInodeFromDirectory(fileName).index
    }
    catch {}
  }
})

const extentsEl = ref<HTMLDivElement>()
onMounted(() => {
  watch(selectedFile?.extentTree?.extents, () => {
    if (selectedFile?.extentTree?.extents.length > 0) {
      requestAnimationFrame(() => {
        extentsEl.value!.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
        extentsEl.value!.scrollTop = extentsEl.value!.scrollHeight
      })
    }
  }, {
    deep: true,
  })
})

watchEffect(() => {
  const flashInodeId = last(actionsState.value.inodeBitmap?.flash)
  requestAnimationFrame(() => {
    document.getElementById(`inodeBitmap-${flashInodeId}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  })
})

watchEffect(() => {
  const selectedInodeId = last(actionsState.value.inodeBitmap?.selected)
  requestAnimationFrame(() => {
    document.getElementById(`inodeBitmap-${selectedInodeId}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  })
})

watchEffect(() => {
  const selectedBlockBitmapId = last(actionsState.value.blockBitmap?.selected)
  requestAnimationFrame(() => {
    document.getElementById(`blockBitmap-${selectedBlockBitmapId}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  })
})

watchEffect(() => {
  const flashBlockBitmapId = last(actionsState.value.blockBitmap?.flash)
  requestAnimationFrame(() => {
    document.getElementById(`blockBitmap-${flashBlockBitmapId}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  })
})

watchEffect(() => {
  const selectedExtent = last(actionsState.value.extent?.selected)
  requestAnimationFrame(() => {
    document.getElementById(`extent-${selectedExtent}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  })
})

watchEffect(() => {
  const flashExtent = last(actionsState.value.extent?.flash)
  requestAnimationFrame(() => {
    document.getElementById(`extent-${flashExtent}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  })
})
</script>

<template>
  <section
    class="area-[fs] max-h-500px" data-tour="fs-component"
    scrollbar="~ rounded hover:thumb-color-#55626f transition-color"
  >
    <h4 underline font="semibold">
      Block Bitmap
    </h4>
    <div scrollbar="~ rounded hover:thumb-color-#55626f transition-color" class=" px3 mx1 max-h-80px">
      <table class="w-full">
        <thead>
          <tr class="text-gray-400">
            <td text-sm>
              Block No.
            </td>
            <td>
              Status
            </td>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="bitmap in ext4fs.blockBitmap" :id="`blockBitmap-${bitmap.index}`" :key="bitmap.index"
            class="border-b border-b-gray-300" :class="{ ...renderStateClass(bitmap.index, 'blockBitmap') }"
          >
            <td>{{ bitmap.index }}</td>
            <td>{{ bitmap.free ? 'Free' : 'Used' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h4 underline font="semibold" mt="2">
      Inode Bitmap
    </h4>
    <div scrollbar="~ rounded hover:thumb-color-#55626f transition-color" class=" px3 mx1 max-h-80px">
      <table class="w-full">
        <thead>
          <tr class="text-gray-400">
            <td text-sm>
              Inode No.
            </td>
            <td>
              Status
            </td>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="bitmap in ext4fs.inodeBitmap" :id="`inodeBitmap-${bitmap.index}`" :key="bitmap.index"
            class="border-b border-b-gray-300"
            :class="[{ ...renderStateClass(bitmap.index, 'inodeBitmap') }, { 'hover:bg-blue-gray-200/50 hover:cursor-pointer': !animating }]"
            @click="setSelectedInodeHandler(bitmap.index)"
          >
            <td>{{ bitmap.index }}</td>
            <td>{{ bitmap.free ? 'Free' : 'Used' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h4 mt="3" underline font="semibold">
      Inode
    </h4>
    <div grid="~ cols-2" class="">
      <div font="semibold">
        Inode No.
      </div>
      <div>{{ selectedFile.index }}</div>
      <div font="semibold">
        Name
      </div>
      <div flex="~ nowrap" class="items-center">
        <div class="max-w-100px text-ellipsis overflow-hidden whitespace-nowrap">
          {{ selectedFile.name === '/' ? 'Root Directory' : selectedFile.name }}
        </div>
        <span
          v-if="selectedFile.name !== ''" v-bg-color="selectedFile.color" border="2px gray-1"
          class="inline-block mx-a h-0.75rem w-0.75rem rounded-full"
        />
      </div>
      <div font="semibold">
        Size
      </div>
      <div>{{ selectedFile.size }}</div>
    </div>

    <div font="semibold">
      Extents
    </div>
    <div ref="extentsEl" scrollbar="~ rounded hover:thumb-color-#55626f transition-color" class=" px3 mx1 max-h-100px">
      <table class="w-full">
        <thead>
          <tr class="text-gray-400">
            <td>
              No.
            </td>
            <td>
              Start
            </td>
            <td>
              Length
            </td>
            <td>
              Blocks
            </td>
          </tr>
        </thead>
        <tbody>
          <tr v-if="selectedFile.extentTree.extents.length <= 0">
            <td colspan="4" class="text-center">
              No extents being allocated
            </td>
          </tr>
          <tr
            v-for="(extent, i) in selectedFile.extentTree.extents" v-else :id="`extent-${i}`" :key="i"
            class="border-b border-b-gray-300"
          >
            <td>{{ i + 1 }}</td>
            <td>{{ extent.start }}</td>
            <td>{{ extent.length }}</td>
            <td>{{ `${extent.start} - ${extent.end - 1}` }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="selectedFile.allocatedBlock.length">
      <div mt="2" font="semibold">
        Allocated Blocks
      </div>
      <div>
        {{ selectedFile.allocatedBlock }}
      </div>
    </div>
  </section>
</template>

<style>
.tooltips {
  --at-apply: inline-block bg-white shadow-md rounded text-sm px2 py2 z-1
}
</style>

<style scoped>
.selected {
  --at-apply: bg-gray/20
}
</style>
