import { includes } from 'lodash-es'
import randomColor from 'randomcolor'
import type { Ref } from 'vue'
import type { ActionState } from './actions'

export interface Actions {
  steps: Step[]
  codes: Code[]
  name: 'read' | 'write' | 'delete' | 'append' | 'create' | string
  file: ActionFile
  interval: number
  state: ActionState
  actionsToBeExecuted: ActionCallback[]
}

export interface ActionCallback {
  callback: () => void
}

export interface ActionState {
  stepIndex: number
  codeIndex: number
  block?: UIState
  file?: UIState
  fat?: UIState
}

export interface UIState {
  selected: number[]
  flash: number[]
}

export interface Step {
  index: number
  description: string
  state?: 'current' | ''
}

export interface Code {
  index: number
  code: string
  state?: 'current' | ''
}

export interface ActionFile {
  name: string
  size: number
  color: string
  currentSize: number
}

const defaultActions: Partial<Actions> = {
  steps: [],
  codes: [],
  name: undefined,
  file: {
    name: '',
    size: 0,
    currentSize: 0,
    color: '',
  },
  interval: 1000,
  state: {
    codeIndex: 0,
    stepIndex: 0,
  },
  actionsToBeExecuted: [],
}

export const actions = ref(defaultActions) as Ref<Actions>
export const actionsState = computed(() => actions.value.state || {})
export const actionsFile = computed(() => {
  if (actions.value.file.name !== undefined && actions.value.file.name !== '')
    return actions.value.file
})
export function renderStateClass(itemIndex: number, type: 'fat' | 'block' | 'file') {
  const { block, file, fat } = actionsState.value
  switch (type) {
    case 'fat':
      return {
        'selected': includes(fat?.selected, itemIndex),
        'selected-flash': includes(fat?.flash, itemIndex),
      }
    case 'block':
      return {
        'selected': includes(block?.selected, itemIndex),
        'selected-flash': includes(block?.flash, itemIndex),
      }
    case 'file':
      return {
        'selected': includes(file?.selected, itemIndex),
        'selected-flash': includes(file?.flash, itemIndex),
      }
  }
}
export function setActions(actionName: Actions['name'], options?: Partial<Omit<Actions, 'interval, state'>>) {
  const newAction = {
    name: actionName,
    file: {
      name: inputs.value.fileName,
      size: inputs.value.fileSize,
      currentSize: inputs.value.fileAction === 'read' ? 0 : inputs.value.fileSize,
      color: randomColor({ luminosity: 'light', seed: inputs.value.fileName }),
    },
  }
  actions.value = { ...defaultActions, ...newAction, ...options } as Actions
}

