import { createApp, h } from 'vue'
import FabRequest from '../components/FabRequest.vue'
import { eventBus } from '../utils/eventBus.js'

let fabApp = null
let fabRootEl = null

export function mountFab() {
  if (fabApp) {
    unmountFab()
  }
  const div = document.createElement('div')
  div.id = 'rup-fab-root'
  document.body.appendChild(div)
  const app = createApp({
    render() {
      return h(FabRequest, {
        onOpenEditor: () => {
          eventBus.emit('rup:open-editor')
        }
      })
    }
  })
  app.mount(div)
  fabApp = app
  fabRootEl = div
}

export function unmountFab() {
  if (fabApp) {
    fabApp.unmount()
  }
  if (fabRootEl && fabRootEl.parentNode) {
    fabRootEl.parentNode.removeChild(fabRootEl)
  }
  fabApp = null
  fabRootEl = null
}

export function isFabMounted() {
  return !!fabApp
}
