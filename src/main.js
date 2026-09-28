// RUP 油猴脚本主入口
// ⚠️【关键】仅在 TOP FRAME（主窗口）执行，任何 iframe / frame / nested-iframe 内一律直接 return
//    原因：Tampermonkey 菜单是「浏览器级」共享的；若多个 frame 各自 registerMenus，
//    点击菜单项时每个 frame 的 onClick 都会被调用一次 → 出现多个相同 notification / FAB 重复挂载等问题
(function topFrameGuard() {
  try {
    if (typeof window === 'undefined') return
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

// ★ 全局大兜底：任何模块初始化异常都不会让整个脚本废掉
//   （比如某个网站重写了 localStorage/Array.prototype，导致 storage 或 eventBus 抛错）
;(function safeBootstrap() {
  try {
    bootstrap()
  } catch (e) {
    try { console && console.error && console.error('[RUP] 脚本初始化异常，已自动降级部分功能：', e) } catch {}
    tryEmergencyFallback()
  }
})()

function bootstrap() {
  // 1) 存储初始化：若配置为空，则写入默认结构
  try {
    const cfg = getFullConfig()
    if (!cfg.enabledDomains || !cfg.domainConfigs) {
      setFullConfig({ enabledDomains: [], domainConfigs: {} })
    }
  } catch (e) { /* 静默 */ }

  // 2) 菜单注册（首次加载立即注册一次，使用当前 hostname）
  const currentHostname = (function getHostnameSafe() {
    try { return window.location.hostname || 'unknown' } catch { return 'unknown' }
  })()
  try { registerMenus(currentHostname) } catch (e) { /* 静默 */ }

  // 3) 根据域名启用状态，自动挂载 FAB
  if (isDomainEnabled(currentHostname)) {
    try { mountFab() } catch (e) { /* 忽略宿主 DOM 异常 */ }
  }

  // 4) 订阅全局事件总线（每个订阅回调独立 try/catch）
  // 4.1 域名启用/禁用切换 → 挂载或卸载 FAB
  eventBus.on('rup:domain-toggle', ({ hostname, enabled }) => {
    if (hostname !== currentHostname) return
    try {
      if (enabled) mountFab()
      else { try { unmountFab() } catch {} try { unmountEditor() } catch {} }
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
      try { unmountFab() } catch {}
      if (isDomainEnabled(currentHostname)) mountFab()
      refreshMenus()
    } catch {}
  })
}

// ============================================================
//  紧急兜底：当模块初始化出错时，至少注册一个「紧急备份」菜单项
//  （防止用户数据因为脚本崩溃而无法导出）
// ============================================================
function tryEmergencyFallback() {
  try {
    if (typeof GM_registerMenuCommand !== 'function') return
    GM_registerMenuCommand('🐰 RUP：💾 备份与恢复（紧急）', function () {
      try {
        const cfg = (typeof GM_getValue === 'function')
          ? (GM_getValue('rup_full_config', null) || { enabledDomains: [], domainConfigs: {} })
          : (function () {
              try { return JSON.parse(localStorage.getItem('rup_full_config')) || { enabledDomains: [], domainConfigs: {} } }
              catch { return { enabledDomains: [], domainConfigs: {} } }
            })()
        const blob = new Blob([JSON.stringify(cfg, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'rup-backup-emergency.json'
        a.click()
        setTimeout(() => URL.revokeObjectURL(url), 500)
      } catch (err) {
        try { alert('RUP 紧急备份失败：' + (err && err.message ? err.message : err)) } catch {}
      }
    })
  } catch {}
}
