<script setup lang="ts">
import { exportModal } from '~/composables/exportModal'
import { importModal } from '~/composables/importModal'
defineProps<{
  show: boolean
}>()
const { toggleExport } = exportModal()
const { toggleImport } = importModal()
function closeAllModal() {
  toggleExport(false)
  toggleImport(false)
}
</script>

<template>
  <teleport v-if="show" to="#modal">
    <div class="absolute inset-0 w-screen h-screen z-50 items-center justify-center" bg="white/80" flex="~"
      @click.self="closeAllModal()">
      <div bg="white" flex="~ col" class="items-center shadow-lg rounded min-w-500px" py="8">
        <header flex="~" justify="between" items="center" w="full" px="5">
          <div text="2xl center" font="bold" flex="1" ml="5">
            <slot name="title" />
          </div>
          <button icon-btn i-mdi:close @click="closeAllModal()" />
        </header>
        <div flex="~ col gap-y-3" w="full" items="center" px="10" mt="5">
          <slot />
        </div>
      </div>
    </div>
  </teleport>
</template>

<style>
</style>

