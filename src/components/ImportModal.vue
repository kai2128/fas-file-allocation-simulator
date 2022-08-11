<script setup lang="ts">
import { importModal } from '~/composables/importModal'
const { show, textareaInput, importSteps, toggleImport } = importModal()
const fileInputEl = ref<HTMLInputElement>()
function handleFileUpload() {
  const file = fileInputEl.value?.files![0]
  if (file) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string)
        textareaInput.value = JSON.stringify(json, null, 4)
      }
      catch (e) {
        notify('Please upload an valid JSON fas-history file.', 'ERROR')
      }
    }
    reader.readAsText(file)
  }
}
async function importHandler() {
  importSteps()
  notify('History steps imported', 'SUCCESS')
  textareaInput.value = ''
  toggleImport(false)
}
</script>

<template>
  <Modal :show="show">
    <template #title>
      Import
    </template>
    <div w="full">
      <textarea v-model="textareaInput" font="mono" rows="20" placeholder="Paste history steps here" />
      <button class="btn" @click="fileInputEl?.click()">
        Upload from file
      </button>
      <input ref="fileInputEl" type="file" hidden @change="handleFileUpload()">
    </div>
    <div flex="~" gap-x-10>
      <button class="btn" @click="importHandler()">
        Import
      </button>
    </div>
  </Modal>
</template>

<style>
</style>
