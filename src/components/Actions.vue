<script setup lang="ts">
import { actions } from '~/composables/actions'

function bold(str: string) {
  return `<b>${str}</b>`
}

const renderSteps = computed(() => {
  const steps = actions.value.steps
  const currentStep = actions.value.state.stepIndex
  const htmlSteps = steps.reduce((str, step, i) => {
    return `${str}
              <li>${i === currentStep ? bold(step.description) : step.description}</li>`
  }, '<ol>')
  return `${htmlSteps}</ol>`
})

// const renderCode = computed(() => {
//   const code = actions.value.codes.map((code) => {
//     return `<pre>${code.code}</pre>`
//   }).join('\n')
//   return code
// })

watch(() => actions.value.state.stepIndex, () => {
  requestAnimationFrame(() => {
    const currentStep = document.querySelector('#steps li b')
    if (currentStep != null)
      currentStep.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  })
}, {

})
</script>

<template>
  <section class="area-[action]">
    <div class="flex justify-between">
      <h1 class="font-bold text-2xl">
        Action
        <span text="sm" font="normal">
          {{ actions.name || '-' }}
        </span>
      </h1>
      <div flex="~ gap-x-5">
        <button i-mdi:cancel class="icon-btn" @click="toggleAniInput.disabled(true)" title="Disable animation" />
      </div>
    </div>

    <div>{{ actions.state.msg }}</div>
    <div class="flex-1 min-h-100px">
      <div text="sm">
        Steps
      </div>
      <!-- <div text="gray/70 xs" class="vertical-bottom">
        Pseudocode
      </div> -->
      <div id="steps" class="prose max-h-220px"
        scrollbar="~ rounded hover:thumb-color-#55626f transition-color whitespace-pre-line" v-html="renderSteps" />
      <!-- <div
        class="bg-gray-200 before:content-[Peusdocode] min-h-[7rem] font-mono"
        scrollbar="~ rounded hover:thumb-color-#55626f transition-color" v-html="renderCode"
      /> -->
    </div>
    <div />
    <div class="flex items-center justify-center " text="#3b5978 2xl" mt="5">
      <button i-fluent:fast-forward-16-filled transform="rotate-180" />
      <button i-ic:round-play-circle />
      <button i-fluent:fast-forward-16-filled />
    </div>
  </section>
</template>

<style scoped>

</style>
