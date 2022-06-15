import type { Ref } from 'vue'

type NotiType = 'INFO' | 'SUCCESS' | 'ERROR'

interface NotiState {
  showNotification: Ref<boolean>
  toggleNoti: () => void
  type: NotiType
  message: string
  styles: string
}

const styles = {
  INFO: 'noti-info',
  ERROR: 'noti-error',
  SUCCESS: 'noti-success',
}

const notiState = ref({}) as Ref<NotiState>
const timer = ref()
const [showNotification, toggleNotification] = useToggle(false)
notiState.value = {
  showNotification,
  toggleNoti: toggleNotification,
  type: 'INFO',
  message: '',
  styles: styles.INFO,
}
export function useNotify() {
  return {
    notiState,
    toggleNotification,
    notify(message: string, type: NotiType = 'INFO', timeout = 3000) {
      notiState.value.type = type.toUpperCase() as NotiType
      notiState.value.message = message
      notiState.value.styles = styles[type.toUpperCase()]

      if (showNotification.value === true) {
        clearTimeout(timer.value)
        if (timeout) {
          timer.value = setTimeout(() => {
            toggleNotification()
          }, timeout)
        }
        return
      }

      toggleNotification()
      if (timeout) {
        timer.value = setTimeout(() => {
          toggleNotification()
        }, timeout)
      }
    },
  }
}

export function notify(message: string, type: NotiType = 'INFO', timeout = 3000) {
  return useNotify().notify(message, type, timeout)
}
