// RUP 油猴脚本主入口
import { getFullConfig, setFullConfig, isDomainEnabled } from './storage/index.js'
import { registerMenus, refreshMenus } from './menu/index.js'
import { eventBus } from './utils/eventBus.js'
import { mountFab, unmountFab } from './mount/fab.js'
import { mountEditor, unmountEditor } from './mount/editor.js'
import { mountBackup, unmountBackup } from './mount/backup.js'

// 1) 存储初始化：若配置为空，则写入默认结构
(function initStorage() {
  const cfg = getFullConfig()
  if (!cfg.enabledDomains || !cfg.domainConfigs) {
    setFullConfig({ enabledDomains: [], domainConfigs: {} })
  }
})()

// 2) 菜单注册（首次加载立即注册一次，使用当前 hostname）
const currentHostname = (function getHostnameSafe() {
  try { return window.location.hostname || 'unknown' } catch { return 'unknown' }
})()
registerMenus(currentHostname)

// 3) 根据域名启用状态，自动挂载 FAB
if (isDomainEnabled(currentHostname)) {
  try { mountFab() } catch (e) { /* 忽略宿主 DOM 异常 */ }
}

// 4) 订阅全局事件总线
// 4.1 域名启用/禁用切换 → 挂载或卸载 FAB
eventBus.on('rup:domain-toggle', ({ hostname, enabled }) => {
  if (hostname !== currentHostname) return
  try {
    if (enabled) mountFab()
    else { unmountFab(); unmountEditor() }
  } catch (e) { /* 静默 */ }
})
// 4.2 打开参数编辑器 → 仅在启用域名下允许
eventBus.on('rup:open-editor', () => {
  if (isDomainEnabled(currentHostname)) { try { mountEditor() } catch {} }
})
// 4.3 打开备份恢复
eventBus.on('rup:open-backup', () => { try { mountBackup() } catch {} })
// 4.4 导入配置后：根据当前 hostname 是否被新配置启用，同步 FAB 状态 + 刷新菜单黑/绿笔图标
eventBus.on('rup:config-imported', () => {
  try {
    unmountFab()
    if (isDomainEnabled(currentHostname)) mountFab()
    refreshMenus()
  } catch {}
})
