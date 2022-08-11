<script setup lang="ts">
import { exportModal } from '~/composables/exportModal'
import { stepsHistory } from '~/composables/state'
const { show } = exportModal()
function saveFileHandler() {
  const file = new File([JSON.stringify(stepsHistory.value)], 'fas-steps.json', { type: 'application/json' })
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = 'fas-history.json'
  a.click()
  URL.revokeObjectURL(url)
  notify('JSON file generated.', 'INFO')
}

async function copyToClipboard() {
  await navigator.clipboard.writeText(JSON.stringify(stepsHistory.value, null, 4))
  notify('Copied to clipboard', 'INFO')
}
</script>

<template>
  <Modal :show="show">
    <template #title>
      Export
    </template>
    <div text="left" w="full" mb="-2">
      History steps:
    </div>
    <div w="full">
      <textarea readonly :value="JSON.stringify(stepsHistory, null, 4)" font="mono" rows="20" />
    </div>
    <div flex="~" gap-x-10 justify="between" px="5">
      <button class="btn" @click="copyToClipboard()">
        Copy to clipboard
      </button>
      <button class="btn" @click="saveFileHandler()">
        Save as file
      </button>
    </div>
  </Modal>
</template>

<style>
</style>
