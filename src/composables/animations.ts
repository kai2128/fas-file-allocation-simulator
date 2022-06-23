import { cloneDeep, first, last } from 'lodash-es'
import type { Actions } from './actions'
import { actions, resetActionsSelectedState, setCurrentFileSize } from './actions'

import type { FSApi } from './../libs/fs/types'
import type { Disk } from '~/libs/volume/disk'
import { fatAnimation } from '~/libs/fs/fat/fatAnimation'
import type { FatFs } from '~/libs/fs/fat'

interface AppState {
  actions: Actions
  disk: Disk
  fs: FSApi
}

type AnimationCallback = () => void

let initialState: AppState

export const appStates: AnimationCallback[] = []

export function initInitialState() {
  appStates.length = 0
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

export function addState(callBack: () => void, toResetState = true) {
  appStates.push(generateAnimationState(callBack, toResetState))
}

export async function startAnimation() {
  for (let i = 0; i < appStates.length; i++) {
    animateState(appStates[i])
    await sleep(1000) // TODO: make this to reactive inputs
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function animateState(states: AnimationCallback) {
  states()
}

export function initAnimation() {
  initInitialState()
  const { create } = fatAnimation(fs.value as any as FatFs, disk.value, actions.value)
  
  create()
}
