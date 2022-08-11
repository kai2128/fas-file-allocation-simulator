import { parseImportSteps } from '~/composables/state'
const [show, toggleImport] = useToggle()
const textareaInput = ref('')
function importSteps() {
  if (textareaInput.value === '') {
    notify('Import steps is empty', 'INFO')
    return
  }

  const steps = JSON.parse(textareaInput.value)
  parseImportSteps(steps)
}

export function importModal() {
  return {
    textareaInput,
    importSteps,
    show,
    toggleImport,
  }
}
