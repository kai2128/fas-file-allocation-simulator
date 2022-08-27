import type { Ref } from 'vue'
import { remove } from 'lodash-es'

type NotiType = 'INFO' | 'SUCCESS' | 'ERROR'

interface NotiState {
  id: string
  showNotification: Ref<boolean>
  type: NotiType
  message: string
  styles: string
}

const styles = {
  INFO: 'noti-info',
  ERROR: 'noti-error',
  SUCCESS: 'noti-success',
}

const notiQueue = ref([]) as Ref<NotiState[]>
export function useNotify() {
  return {
    notiQueue,
    closeNoti(id: string) {
      remove(notiQueue.value, noti => noti.id === id)
    },
    notify(message: string, type: NotiType = 'INFO', timeout = 3000) {
      const id = Math.random().toString(36).substr(2, 9)
      notiQueue.value.push({
        id,
        type,
        message,
        styles: styles[type],
      } as NotiState)

      if (notiQueue.value.length > 5)
        notiQueue.value.shift()

      setTimeout(() => {
        remove(notiQueue.value, noti => noti.id === id)
      }, timeout)
    },
  }
}

export function notify(message: string, type: NotiType = 'INFO', timeout = 3000) {
  return useNotify().notify(message, type, timeout)
}
