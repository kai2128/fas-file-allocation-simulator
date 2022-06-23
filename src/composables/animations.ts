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

let initialState: AppState

let animationStates: Generator

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

export function addState(callBack: () => void, toResetState = true) {
  appStates.push(generateAnimationState(callBack, toResetState))
}

export async function startAnimation() {
  while (!animationStates.next().done)
    await sleep(1000) // TODO: set interval reactive
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// function animateState(states: AnimationCallback) {
//   states()
// }

export function initAnimation() {
  initInitialState()
  const { create } = fatAnimation(fs.value as any as FatFs, disk.value, actions.value)
  animationStates = create()
}
