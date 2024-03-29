import { curry, includes } from 'lodash-es'
import randomColor from 'randomcolor'
import type { Ref } from 'vue'

export interface Actions {
  steps: Step[]
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
  msg: string
  stepIndex: number
  codeIndex: number
  block?: UIState
  file?: UIState
  fat?: UIState
  directory?: UIState
  inodeBitmap?: UIState
  blockBitmap?: UIState
  extent?: UIState
  selectedInode: number
}

export interface UIState {
  selected: number[] | string[]
  flash: number[] | string[]
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

const defaultActions: Actions = {
  steps: [],
  name: '',
  file: {
    name: '',
    size: 0,
    currentSize: 0,
    color: '',
  },
  interval: 1000,
  state: {
    msg: '',
    codeIndex: 0,
    stepIndex: 0,
    block: {
      flash: [],
      selected: [],
    },
    directory: {
      flash: [],
      selected: [],
    },
    fat: {
      flash: [],
      selected: [],
    },
    file: {
      flash: [],
      selected: [],
    },
    inodeBitmap: {
      flash: [],
      selected: [],
    },
    blockBitmap: {
      flash: [],
      selected: [],
    },
    extent: {
      flash: [],
      selected: [],
    },
    selectedInode: 0,
  },
  actionsToBeExecuted: [],
}

export const actions = ref(defaultActions) as Ref<Actions>
export const actionsState = computed(() => actions.value.state || {})
export const actionsFile = computed(() => {
  if (actions.value.file.name !== undefined && actions.value.file.name !== '')
    return actions.value.file
})
export function renderStateClass(itemIndex: number | string, type: 'fat' | 'block' | 'file' | 'dir' | 'inodeBitmap' | 'blockBitmap' | 'extent') {
  const { block, file, fat, directory, inodeBitmap, blockBitmap, extent } = actionsState.value
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
    case 'dir':
      return {
        'selected': includes(directory?.selected, itemIndex),
        'selected-flash': includes(directory?.flash, itemIndex),
      }
    case 'inodeBitmap':
      return {
        'selected': includes(inodeBitmap?.selected, itemIndex),
        'selected-flash': includes(inodeBitmap?.flash, itemIndex),
      }
    case 'blockBitmap':
      return {
        'selected': includes(blockBitmap?.selected, itemIndex),
        'selected-flash': includes(blockBitmap?.flash, itemIndex),
      }
    case 'extent':
      return {
        'selected': includes(extent?.selected, itemIndex),
        'selected-flash': includes(extent?.flash, itemIndex),
      }
  }
}
export function setActions(actionName: Actions['name'], options?: Partial<Omit<Actions, 'interval, state'>>) {
  const newAction = {
    name: actionName,
    file: {
      name: inputs.value.fileName,
      size: inputs.value.fileSize,
      currentSize: actionName === 'read' ? 0 : inputs.value.fileSize,
      color: randomColor({ luminosity: 'light', seed: inputs.value.fileName }),
    },
  }
  actions.value = { ...defaultActions, ...newAction, ...options } as Actions
}
export function setStepsDesc(steps: Step[]) {
  actions.value.steps = steps
}
export function resetActionsState() {
  actions.value = defaultActions as Actions
}
export function resetActionsSelectedState(stateTypes?: Array<'block' | 'fat' | 'directory' | 'file' | 'extent' | 'blockBitmap' | 'inodeBitmap'>) {
  if (stateTypes == null) {
    actions.value.state.block!.selected = []
    actions.value.state.fat!.selected = []
    actions.value.state.file!.selected = []
    actions.value.state.directory!.selected = []
    actions.value.state.block!.flash = []
    actions.value.state.fat!.flash = []
    actions.value.state.file!.flash = []
    actions.value.state.inodeBitmap!.selected = []
    actions.value.state.inodeBitmap!.flash = []
    actions.value.state.directory!.flash = []
    actions.value.state.blockBitmap!.selected = []
    actions.value.state.blockBitmap!.flash = []
    actions.value.state.extent!.selected = []
    actions.value.state.extent!.flash = []
  }

  stateTypes?.forEach((t) => {
    actions.value.state[t]!.selected = []
    actions.value.state[t]!.flash = []
  })
}
export function setMsg(msg: string, type: 'info' | 'error' | 'warning' | 'done' = 'info') {
  actions.value.state.msg = msg
}

function state(stateTypes: 'block' | 'fat' | 'directory' | 'file' | 'inodeBitmap' | 'blockBitmap' | 'extent', selected: number[] | string[] | undefined, flash: number[] | string[] | undefined) {
  if (flash)
    actions.value.state[stateTypes]!.flash = flash
  if (selected)
    actions.value.state[stateTypes]!.selected = selected
}
const curriedState = curry(state)
export const setState = {
  block: curriedState('block'),
  blockFlash(flash: number[] | string[]) {
    curriedState('block', undefined, flash)
  },
  blockSelected(selected: number[] | string[]) {
    curriedState('block', selected, undefined)
  },
  fat: curriedState('fat'),
  fatFlash(flash: number[] | string[]) {
    curriedState('fat', undefined, flash)
  },
  fatSelected(selected: number[] | string[]) {
    curriedState('fat', selected, undefined)
  },
  directory: curriedState('directory'),
  directoryFlash(flash: number[] | string[]) {
    curriedState('directory', undefined, flash)
  },
  directorySelected(selected: number[] | string[]) {
    curriedState('directory', selected, undefined)
  },
  file: curriedState('file'),
  fileFlash(flash: number[] | string[]) {
    curriedState('file', undefined, flash)
  },
  fileSelected(selected: number[] | string[]) {
    curriedState('file', selected, undefined)
  },
  inodeBitmap: curriedState('inodeBitmap'),
  inodeBitmapFlash(flash: number[] | string[]) {
    curriedState('inodeBitmap', undefined, flash)
  },
  inodeBitmapSelected(selected: number[] | string[]) {
    curriedState('inodeBitmap', selected, undefined)
  },
  blockBitmap: curriedState('blockBitmap'),
  blockBitmapFlash(flash: number[] | string[]) {
    curriedState('blockBitmap', undefined, flash)
  },
  blockBitmapSelected(selected: number[] | string[]) {
    curriedState('blockBitmap', selected, undefined)
  },
  extent: curriedState('extent'),
  extentFlash(flash: number[] | string[]) {
    curriedState('extent', undefined, flash)
  },
  extentSelected(selected: number[] | string[]) {
    curriedState('extent', selected, undefined)
  },
  reset: resetActionsSelectedState,
}
