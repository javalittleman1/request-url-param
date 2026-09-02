import { createApp, ref, h } from 'vue'
import ParamEditor from '../components/ParamEditor.vue'
import { eventBus } from '../utils/eventBus.js'

let editorApp = null
let editorRootEl = null
let eventSubscribed = false

function subscribeEvent() {
  if (eventSubscribed) return
  eventSubscribed = true
  eventBus.on('rup:open-editor', mountEditor)
}

export function mountEditor() {
  subscribeEvent()

  if (editorApp) {
    unmountEditor()
  }

  const div = document.createElement('div')
  div.id = 'rup-editor-root'
  document.body.appendChild(div)

  const visibleRef = ref(true)

  const app = createApp({
    setup() {
      return () => {
        return h(ParamEditor, {
          visible: visibleRef.value,
          'onUpdate:visible': (val) => {
            visibleRef.value = val
          },
          onClose: () => {
            visibleRef.value = false
            setTimeout(() => {
              unmountEditor()
            }, 0)
          }
        })
      }
    }
  })

  app.mount(div)
  editorApp = app
  editorRootEl = div
}

export function unmountEditor() {
  if (editorApp) {
    try {
      editorApp.unmount()
    } catch (e) {
    }
  }
  if (editorRootEl && editorRootEl.parentNode) {
    editorRootEl.parentNode.removeChild(editorRootEl)
  }
  editorApp = null
  editorRootEl = null
}

export function isEditorMounted() {
  return !!editorApp
}
