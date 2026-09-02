import { createApp, ref, h } from 'vue'
import BackupRestore from '../components/BackupRestore.vue'
import { eventBus } from '../utils/eventBus.js'

let backupApp = null
let backupRootEl = null
let eventSubscribed = false

function subscribeEvent() {
  if (eventSubscribed) return
  eventSubscribed = true
  eventBus.on('rup:open-backup', mountBackup)
}

export function mountBackup() {
  subscribeEvent()

  if (backupApp) {
    unmountBackup()
  }

  const div = document.createElement('div')
  div.id = 'rup-backup-root'
  document.body.appendChild(div)

  const visibleRef = ref(true)

  const app = createApp({
    setup() {
      return () => {
        return h(BackupRestore, {
          visible: visibleRef.value,
          'onUpdate:visible': (val) => {
            visibleRef.value = val
          },
          onClose: () => {
            visibleRef.value = false
            setTimeout(() => {
              unmountBackup()
            }, 0)
          }
        })
      }
    }
  })

  app.mount(div)
  backupApp = app
  backupRootEl = div
}

export function unmountBackup() {
  if (backupApp) {
    try {
      backupApp.unmount()
    } catch (e) {
    }
  }
  if (backupRootEl && backupRootEl.parentNode) {
    backupRootEl.parentNode.removeChild(backupRootEl)
  }
  backupApp = null
  backupRootEl = null
}

export function isBackupMounted() {
  return !!backupApp
}
