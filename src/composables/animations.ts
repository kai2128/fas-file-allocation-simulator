import { cloneDeep } from 'lodash-es'
import type { Actions } from './actions'
import { actions, resetActionsSelectedState } from './actions'

import type { FSApi } from './../libs/fs/types'
import { toggleAniInput } from './state'
import type { FatFs } from '~/libs/fs/fat'
import { fatActions } from '~/libs/fs/fat'
import { fatAnimation } from '~/libs/fs/fat/fatAnimation'
import type { Disk } from '~/libs/volume/disk'
import type { Ext4 } from '~/libs/fs/ext4'
import { ext4Animation, ext4Action } from '~/libs/fs/ext4'
interface AppState {
  actions: Actions
  disk: Disk
  fs: FSApi
}

export interface AnimationGenerator {
  create(): Generator<{
    actions: Actions
    disk: Disk
    fs: FatFs | Ext4
  }, void, unknown>
  delete(): Generator<{
    actions: Actions
    disk: Disk
    fs: FatFs | Ext4
  }, void, unknown>
  append(): Generator<{
    actions: Actions
    disk: Disk
    fs: FatFs | Ext4
  }, void, unknown>
  read(): Generator<{
    actions: Actions
    disk: Disk
    fs: FatFs | Ext4
  }, void, unknown>
  write(): Generator<{
    actions: Actions
    disk: Disk
    fs: FatFs | Ext4
  }, void, unknown>
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
      setState.reset()
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

function getAnimationAndAction() {
  switch (fs.value.name) {
    case 'FAT':
      return { aniGenerator: fatAnimation(fs.value as any as FatFs, disk.value, actions.value), fsAction: fatActions }
    case 'ext4':
      return { aniGenerator: ext4Animation(fs.value as any as Ext4, disk.value, actions.value), fsAction: ext4Action }
    default:
      throw new Error(`${fs.value.name} is not supported`)
  }
}

export function initAnimation() {
  initInitialState()
  resetAniInputState()
  setMsg('')

  const { aniGenerator, fsAction } = getAnimationAndAction()
  switch (actions.value.name) {
    case 'create':
      fs.value.checkUniqueFileName(actions.value.file.name)
      fs.value.checkSpace(actions.value.file.size)
      setStepsDesc(fsAction.create.steps)
      animationStates = aniGenerator.create()
      break
    case 'delete':
      fs.value.checkFileExist(actions.value.file.name)
      setStepsDesc(fsAction.delete.steps)
      animationStates = aniGenerator.delete()
      break
    case 'read':
      fs.value.checkFileExist(actions.value.file.name)
      setStepsDesc(fsAction.read.steps)
      animationStates = aniGenerator.read()
      break
    case 'write':
      fs.value.checkFileExist(actions.value.file.name)
      // size check
      if (actions.value.file.size > fs.value.fs_searchFileInDirectory(actions.value.file.name)!.size) { // only check disk space if new size is larger than old size{
        fs.value.checkSpace(actions.value.file.size - fs.value.fs_searchFileInDirectory(actions.value.file.name)!.size)
      }
      setStepsDesc(fsAction.write.steps)
      animationStates = aniGenerator.write()
      break
    case 'append':
      fs.value.checkFileExist(actions.value.file.name)
      setStepsDesc(fsAction.append.steps)
      animationStates = aniGenerator.append()
      break
  }
}

