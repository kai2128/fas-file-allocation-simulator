const generatePreferences = useStorage('generationPreferences', {
  lockName: false,
  lockSize: false,
  lockAction: false,
})

const [showPref, togglePref] = useToggle(false)

export function useGeneratePreference() {
  return {
    generatePreferences,
    showPref,
    togglePref,
    toggleGenPref(key: 'lockName' | 'lockSize' | 'lockAction') {
      generatePreferences.value[key] = !generatePreferences.value[key]
    },
  }
}
