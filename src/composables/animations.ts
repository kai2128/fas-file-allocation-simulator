import { cloneDeep } from 'lodash-es'
import type { Actions } from './actions'
import { actions, resetActionsSelectedState } from './actions'

import type { FSApi } from './../libs/fs/types'
import { toggleAniInput } from './state'
import type { FatFs } from '~/libs/fs/fat'
import { fatActions } from '~/libs/fs/fat'
import { fatAnimation } from '~/libs/fs/fat/fatAnimation'
import type { Disk } from '~/libs/volume/disk'

interface AppState {
  actions: Actions
  disk: Disk
  fs: FSApi
}

let initialState: AppState
let animationStates: Generator
export const [nextAniStep, toggleNextStep] = useToggle(false)

export const [animating, toggleAnimating] = useToggle(false)
export function initInitialState() {
  const clonedDisk = disk.value.clone()
  initialState = {
    actions: cloneDeep(actions.value),
    disk: clonedDisk,
    fs: fs.value.clone(clonedDisk),
  }
  return initialState
}

export function getInitialState() {
  return initialState
}

export function generateAnimationState(callBack: () => void, toResetState = true) {
  if (toResetState) {
    return () => {
      resetActionsSelectedState()
      callBack()
    }
  }
  return callBack
}

export async function startAnimation() {
  toggleAnimating(true)
  while (!animationStates.next().done) {
    if (aniInput.value.skip)
      continue

    if (aniInput.value.cancel) {
      revertToInitialState()
      break
    }

    toggleNextStep(false)
    if (!aniInput.value.manualMode)
      await sleep(aniInput.value.interval)
    else
      await until(nextAniStep).toBe(true)
  }
  toggleAnimating(false)
  resetAniInputState()
}
export function nextStep() {
  toggleNextStep(true)
}
watch(() => aniInput.value.manualMode, () => {
  nextStep()
})

function resetAniInputState() {
  toggleAniInput.skip(false)
  toggleAniInput.cancel(false)
}

function revertToInitialState() {
  log(`${actions.value.name} ${actions.value.file.name} cancelled`)
  disk.value = initialState.disk
  fs.value = initialState.fs
  actions.value = initialState.actions
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function initAnimation() {
  initInitialState()
  resetAniInputState()
  setMsg('')
  const fatAniGenerator = fatAnimation(fs.value as any as FatFs, disk.value, actions.value)
  switch (actions.value.name) {
    case 'create':
      fs.value.checkUniqueFileName(actions.value.file.name)
      fs.value.checkSpace(actions.value.file.size)
      setStepsDesc(fatActions.create.steps)
      animationStates = fatAniGenerator.create()
      break
    case 'delete':
      fs.value.checkExist(actions.value.file.name)
      setStepsDesc(fatActions.delete.steps)
      animationStates = fatAniGenerator.delete()
      break
    case 'read':
      fs.value.checkExist(actions.value.file.name)
      setStepsDesc(fatActions.read.steps)
      animationStates = fatAniGenerator.read()
      break
    case 'write':
      fs.value.checkExist(actions.value.file.name)
      // size check
      if (actions.value.file.size > fs.value.searchFileInDirectory(actions.value.file.name)!.size) { // only check disk space if new size is larger than old size{
        fs.value.checkSpace(actions.value.file.size - fs.value.searchFileInDirectory(actions.value.file.name)!.size)
      }
      setStepsDesc(fatActions.write.steps)
      animationStates = fatAniGenerator.write()
      break
    case 'append':
      fs.value.checkExist(actions.value.file.name)
      setStepsDesc(fatActions.append.steps)
      animationStates = fatAniGenerator.append()
      break
  }
}

