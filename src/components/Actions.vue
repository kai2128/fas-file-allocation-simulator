<script setup lang="ts">
import { actions } from '~/composables/actions'
import { animating } from '~/composables/animations'
import { aniInput, toggleAniInput } from '~/composables/state'
function bold(str: string) {
  return `<b>${str}</b>`
}
const renderSteps = computed(() => {
  const steps = actions.value.steps
  const currentStep = actions.value.state.stepIndex
  const htmlSteps = steps.reduce((str, step, i) => {
    return `${str}
              <li>${i === currentStep && !aniInput.value.disabled ? bold(step.description) : step.description}</li>`
  }, '<ol>')
  return `${htmlSteps}</ol>`
})

watch(() => actions.value.state.stepIndex, () => {
  setTimeout(() => {
    requestAnimationFrame(() => {
      const currentStep = document.querySelector('#steps li b')
      if (currentStep != null)
        currentStep.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    })
  }, 100)
})

const computeDisableTitle = computed(() => {
  if (animating.value)
    return 'Cannot disable animation while animating'
  return aniInput.value.disabled ? 'Enable animation' : 'Disable animation'
})

function nearestInterval(equation: 'add' | 'sub') {
  const interval = aniInput.value.interval - (aniInput.value.interval % 1000)
  if (equation === 'add')
    aniInput.value.interval = interval + 1000
  else
    aniInput.value.interval = interval - 1000
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'p')
    toggleAniInput.manualMode()
  if (e.key === 'n') {
    if (aniInput.value.manualMode)
      nextStep()
  }
})

watch(() => aniInput.value.disabled, (v) => {
  if (v)
    notify('Steps by steps animation is disabled', 'INFO')
  else
    notify('Steps by steps animation is enabled', 'INFO')
}, { immediate: false })
</script>

<template>
  <section class="area-[action] of-clip" data-tour="action">
    <div v-if="aniInput.disabled" class="bg-gray/20 absolute inset-0 z-2" />
    <div class="flex justify-between">
      <h1 class="font-bold text-2xl">
        Action
        <span text="sm" font="normal">
          {{ actions.name || '-' }}
        </span>
      </h1>
      <div flex="~ gap-x-5" class="items-center justify-end">
        <div class="flex items-center justify-center mr-15" text="#3b5978 2xl">
          <button
            v-if="!aniInput.manualMode" class="opa-btn" i-ic:round-pause-circle data-tour="action-pause-button"
            title="Pause" @click="toggleAniInput.manualMode(true)"
          />
          <button
            v-else class="opa-btn" i-ic:round-play-circle title="Resume"
            @click="toggleAniInput.manualMode(false)"
          />
          <button
            v-if="aniInput.manualMode" class="opa-btn" i-fluent:fast-forward-16-filled title="Next Step"
            @click="nextStep()"
          />
        </div>

        <div class="relative w-25 block" data-tour="action-interval">
          <div flex="~ col gap-y--4" class="absolute left--4 top-0.5">
            <button
              class="icon-btn text-sm my--0.25" i-fluent:caret-up-24-filled title="Increase interval"
              @click="nearestInterval('add')"
            />
            <button
              class="icon-btn text-sm my--0.25 disabled:cursor-pointer disabled:hover:opacity-70"
              i-fluent:caret-down-24-filled :disabled="aniInput.interval <= 1000" title="Decrease interval"
              @click="nearestInterval('sub')"
            />
          </div>
          <label class=" absolute bottom-5.75 left-2 text-xs z-1 bg-white rounded" for="interval">Interval</label>
          <input id="interval" v-model="aniInput.interval" class="flex py-1 text-sm" type="number">
          <span class="absolute top-1.2 right-2 text-sm z-1 bg-white rounded text-gray/80">ms</span>
        </div>
        <button
          i-mdi:cancel class="icon-btn z-3 disabled:cursor-not-allowed disabled:hover:opacity-75"
          :class="{ 'text-cool-gray-700 opacity-100 shadow-white hover:scale-120 shadow-lg': aniInput.disabled }"
          :disabled="animating" :title="computeDisableTitle" data-tour="action-disable-button"
          @click="toggleAniInput.disabled()"
        />
      </div>
    </div>

    <div>{{ actions.state.msg }}</div>
    <div class="flex-1 min-h-100px">
      <div text="sm">
        Steps
      </div>
      <div
        id="steps" class="prose max-h-220px"
        scrollbar="~ rounded hover:thumb-color-#55626f transition-color whitespace-pre-line" v-html="renderSteps"
      />
    </div>
    <div />
  </section>
</template>

<style scoped>
.opa-btn {
  --at-apply: opacity-70 hover:opacity-100 transition-opacity duration-200
}
</style>
