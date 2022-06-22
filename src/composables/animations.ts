import { first, last } from 'lodash-es'
import type { Actions } from './actions'
import type { FSApi } from './../libs/fs/types'
import type { Disk } from '~/libs/volume/disk'

interface AppState {
  actions: Actions
  disk: Disk
  fs: FSApi
}

export const appStates: AppState[] = []

export function initInitialState() {
  appStates.length = 0
  appStates.push ({
    actions: actions.value,
    disk: disk.value,
    fs: fs.value,
  })
  return appStates[0]
}

export function getInitialState() {
  return first(appStates)
}

export function generateAnimationState({ disk, fs, actions }: Partial<AppState>, mergePrev = true): AppState {
  const prevState = last(appStates) as AppState
  if (mergePrev) {
    return {
      actions: {
        ...prevState.actions,
        ...actions,
      },
      disk: {
        ...prevState.disk,
        ...disk,
      },
      fs: {
        ...prevState.fs,
        ...fs,
      },
    }
  }
  return { disk, fs, actions }
}

export function addState(state: Partial<AppState>, mergePrev = true) {
  appStates.push(generateAnimationState(state, mergePrev))
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

function animateState(states: AppState) {
  actions.value = states.actions
  disk.value = states.disk
  fs.value = states.fs
}
