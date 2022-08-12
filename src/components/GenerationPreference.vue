<script setup lang="ts">
const { showPref, generatePreferences, togglePref, toggleGenPref } = useGeneratePreference()
const divEl = ref<HTMLElement>()

const onClickOutside = (e: Event) => {
  if (!divEl.value?.contains(e.target as Node))
    togglePref(false)
}

watchEffect(() => {
  if (showPref.value === true) {
    requestAnimationFrame(() => {
      document.addEventListener('click', onClickOutside)
    })
  }
  else { document.removeEventListener('click', onClickOutside) }
})
</script>

<template>
  <div v-if="showPref" ref="divEl" class="absolute top-5 right-15 rounded" b="1 gray/30" bg="white" shadow="md" px="3"
    pb="5" pt="3">
    <div mb="3" font="bold">
      Generation Preferences
    </div>
    <div flex="~ col gap-y-2">
      <LockButton @toggle="toggleGenPref('lockAction')" title="Lock Action" :isLocked="generatePreferences.lockAction">
      </LockButton>
      <LockButton @toggle="toggleGenPref('lockName')" title="Lock Name" :isLocked="generatePreferences.lockName">
      </LockButton>
      <LockButton @toggle="toggleGenPref('lockSize')" title="Lock Size" :isLocked="generatePreferences.lockSize">
      </LockButton>
    </div>
  </div>
</template>

<style>
</style>
