import type { App } from 'vue'

export default {
  install: (app: App, options?: any) => {
    app.directive('bg-color', (el, binding) => {
      el.style.backgroundColor = binding.value
    })
  },
}
