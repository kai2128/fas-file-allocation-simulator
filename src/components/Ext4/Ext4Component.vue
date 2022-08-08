<script setup lang="ts">
import type { Ext4 } from '~/libs/fs/ext4'

const ext4fs = $computed(() => { return ((fs.value) as Ext4) })
const selectedFile = $computed(() => {
  try {
    ext4fs.checkFileExist(inputs.value.fileName)
    return ext4fs.getInodeFromDirectory(inputs.value.fileName)
  }
  catch {
    return ext4fs.inodeTable.inodes[ext4fs.rootDirectory.inode]
  }
})

// watchEffect(() => {
//   const selectedFatId = last(actionsState.value.fat?.selected)
//   const flashFatId = last(actionsState.value.fat?.flash)
//   if (flashFatId !== null) {
//     requestAnimationFrame(() => {
//       document.getElementById(`fat-${flashFatId}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
//     })
//   }
//   requestAnimationFrame(() => {
//     document.getElementById(`fat-${selectedFatId}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
//   })
// })
</script>

<template>
  <section class="area-[fs]" data-tour="fs-component">
    <h1 class="font-bold text-xl">
      Ext4
    </h1>
    <h4 underline font="semibold">
      Block Bitmap
    </h4>
    <div scrollbar="~ rounded hover:thumb-color-#55626f transition-color" class=" px3 mx1 max-h-100px">
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
          <tr v-for="bitmap in ext4fs.blockBitmap" :key="bitmap.index" class="border-b border-b-gray-300">
            <td>{{ bitmap.index }}</td>
            <td>{{ bitmap.free ? 'Free' : 'Used' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <h4 mt="3" underline font="semibold">
      Inode
    </h4>
    <div grid="~ cols-2">
      <div font="semibold">
        Inode No.
      </div>
      <div>{{ selectedFile.index }}</div>
      <div font="semibold">
        Name
      </div>
      <div>
        {{ selectedFile.name === '/' ? 'Root Directory' : selectedFile.name }}
        <span
          v-bg-color="selectedFile.color" border="2px gray-1"
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
    <div scrollbar="~ rounded hover:thumb-color-#55626f transition-color" class=" px3 mx1 max-h-100px">
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
          <tr v-for="(extent, i) in selectedFile.extentTree.extents" :key="i" class="border-b border-b-gray-300">
            <td>{{ i + 1 }}</td>
            <td>{{ extent.start }}</td>
            <td>{{ extent.length }}</td>
            <td>{{ `${extent.start} - ${extent.end - 1}` }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div mt="2" font="semibold">
      Allocated Blocks
    </div>
    <div>
      {{ selectedFile.allocatedBlock }}
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
