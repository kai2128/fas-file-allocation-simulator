import { parseImportSteps } from '~/composables/state'
const [show, toggleImport] = useToggle()
const textareaInput = ref('')
function importSteps() {
  if (textareaInput.value === '') {
    notify('Import steps is empty', 'INFO')
    throw new Error('Import steps is empty')
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
        log(`Failed to import, ${(e as Error).message}`, 'ERROR')
        throw e
      }
    })
  }
  catch (err) {
    notify('Failed to import: ' + `${(err as Error).message}`, 'ERROR')
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
