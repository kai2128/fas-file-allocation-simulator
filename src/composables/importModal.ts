import { parseImportSteps } from '~/composables/state'
const [show, toggleImport] = useToggle()
const textareaInput = ref('')
function importSteps() {
  if (textareaInput.value === '') {
    notify('Import steps is empty', 'INFO')
    return
  }

  let steps
  try {
    steps = JSON.parse(textareaInput.value)
    if (steps.length === 0 || steps == null)
      throw new Error('Invalid history steps.')
      
    steps.forEach((step) => {
      try {
        checkValidSteps(step)
      }
      catch (e) {
        notify(`Failed to import, ${(e as Error).message}`, 'ERROR')
        log(`Failed to import, ${(e as Error).message}`, 'ERROR')
        throw e
      }
    })
  }
  catch (err) {
    notify('Import steps is invalid', 'ERROR')
    throw err
  }

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
