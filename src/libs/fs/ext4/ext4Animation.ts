import type { Ext4 } from './ext4'
import type { Disk } from '~/libs/volume'
import type { Actions } from '~/composables/actions'
import type { AnimationGenerator } from '~/composables/animations'

export function ext4Animation(fs: Ext4, disk: Disk, actions: Actions): AnimationGenerator {
  return {
    *create() {
      actions.state.stepIndex = 0
      yield { actions, disk, fs }
    },
    *delete() {

    },
    *append() {

    },
    *read() {

    },
    *write() {

    },
  }
}
