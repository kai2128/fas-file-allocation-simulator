<script setup lang="ts">
import { actionsFile, renderStateClass } from '~/composables/actions'
</script>

<template>
  <div ma>
    <div flex="~ gap-x-2" items-end>
      <span text="">Name: {{ actionsFile.name }}</span>
      <span text="gray/80">|</span>
      <span text="">Size: {{ actionsFile.size }}</span>
    </div>
    <div>
      <div flex="~ row gap-x-1" class="of-x-auto pb1 w-100"
        scrollbar="~ rounded hover:thumb-color-#55626f transition-color">
        <div v-for="i in Number(actionsFile.currentSize)" :key="i" v-bg-color="actionsFile.color" class="blocks"
          flex="none" :class="{ ...renderStateClass(i, 'file') }" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.blocks {
  --at-apply: border-3 rounded border-#e9e9e9 h-30px w-30px transition-all duration-1000;
}
</style>

