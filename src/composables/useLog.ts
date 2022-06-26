import type { Ref } from 'vue'

interface Log {
  time: number
  msg: string
  type: 'INFO' | 'ERROR' | 'WARN' | 'SUCCESS'
}

const logs = ref([]) as Ref<Log[]>
export const log = (msg: string, type: Log['type'] = 'INFO') => {
  logs.value.push({
    time: Date.now(),
    type,
    msg,
  })
}
export function useLog() {
  const log = (msg: string, type: Log['type'] = 'INFO') => {
    logs.value.push({
      time: Date.now(),
      type,
      msg,
    })
  }

  return {
    logs: computed(() => logs.value),
    log,
    clearLogs() { logs.value = [] },
  }
}

