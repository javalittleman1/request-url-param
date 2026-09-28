// RUP 油猴脚本主入口
// ⚠️【关键】仅在 TOP FRAME（主窗口）执行，任何 iframe / frame / nested-iframe 内一律直接 return
//    原因：Tampermonkey 菜单是「浏览器级」共享的；若多个 frame 各自 registerMenus，
//    点击菜单项时每个 frame 的 onClick 都会被调用一次 → 出现多个相同 notification / FAB 重复挂载等问题
(function topFrameGuard() {
  try {
    if (typeof window === 'undefined') return
    // 跨域 iframe 访问 window.top 会抛错，这种场景也直接判定为非顶层
    const isTop = (function () {
      try {
        return window.top === window.self
          || window.top === window
          || window.parent === window.self
      } catch (e) {
        return false
      }
    })()
    if (!isTop) return
  } catch (e) { return }
})()

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
