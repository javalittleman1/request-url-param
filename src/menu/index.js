import { isDomainEnabled, setDomainEnabled } from '../storage/index.js';
import { eventBus } from '../utils/eventBus.js';
import { showToast } from '../utils/toast.js';
import iconDisk from '../assets/icons/iconDisk.js';
import iconRabbit from '../assets/icons/iconRabbit.js';

export const STRATEGY_LABELS = {
  match_only: '仅匹配替换',
  list_only: '只使用本修改列表的参数',
  match_and_diff: '匹配替换+差异参数'
};

export const DEFAULT_DOMAIN_CONFIG = {
  modifyList: [],
  strategy: 'match_only',
  removeEmpty: false
};

// 已注册的菜单命令 ID（用于动态重注册）
let toggleMenuId = null;
let backupMenuId = null;
let registeredHostname = null;

// 🔒 本 frame 防重入锁（@noframes 保证脚本只运行一次，这个锁只是防御极端的栈内重复触发）
let _toggleCallbackLock = false;

/**
 * Unicode 实心圆符号（状态圆点）
 */
const DOT_BLACK = '⚫';
const DOT_GREEN = '🟢';

// 将 SVG 转为 data:image 数据 URL（给菜单项的 image 属性用）
function svgToDataUrl(svgString, size = 16) {
  if (!svgString || typeof svgString !== 'string') return '';
  let svg = svgString.trim()
    .replace(/\s+width="[^"]*"/gi, '')
    .replace(/\s+height="[^"]*"/gi, '')
    .replace(/<svg\s+/i, `<svg width="${size}" height="${size}" `);
  try {
    const encoded = encodeURIComponent(svg)
      .replace(/'/g, '%27')
      .replace(/"/g, '%22');
    return `data:image/svg+xml;charset=UTF-8,${encoded}`;
  } catch (e) {
    return '';
  }
}

const DATA_URLS = {
  disk: svgToDataUrl(iconDisk, 16),
  rabbit: svgToDataUrl(iconRabbit, 16),
};

function hasGmApi() {
  return typeof GM_registerMenuCommand === 'function'
    && typeof GM_unregisterMenuCommand === 'function';
}

/**
 * 注销已有菜单
 */
function unregisterMenus() {
  if (!hasGmApi()) return;
  try {
    if (toggleMenuId !== null) GM_unregisterMenuCommand(toggleMenuId);
    if (backupMenuId !== null) GM_unregisterMenuCommand(backupMenuId);
  } catch (e) { /* 静默 */ }
  toggleMenuId = null;
  backupMenuId = null;
}

/**
 * 注册/重注册单个「修改此页参数」切换菜单项
 * - 用 Unicode 实心圆（黑/绿）+ 明确状态文字标识
 * - 点击后：取反状态 → 持久化 → 事件 → Toast → 注销+重注册菜单（更新状态文字+图标）
 */
function registerToggleMenu(hostname) {
  if (!hasGmApi()) return;
  const enabled = isDomainEnabled(hostname);

  const statusDot = enabled ? DOT_GREEN : DOT_BLACK;
  const statusText = enabled ? '已启用' : '已禁用';
  const menuText = `🐰 RUP：${statusDot} 修改此页参数（${statusText}）`;

  const onClick = function () {
    if (_toggleCallbackLock) return;
    _toggleCallbackLock = true;
    try {
      const currEnabled = isDomainEnabled(hostname);
      const newValue = !currEnabled;
      if (newValue === currEnabled) return;

      setDomainEnabled(hostname, newValue);
      eventBus.emit('rup:domain-toggle', { hostname, enabled: newValue });

      // ✅ 页面内 Toast 单例提示（绝对不会出现重复堆叠）
      showToast(
        newValue ? '🟢 已启用：修改参数功能已打开' : '⚫ 已禁用：修改参数功能已关闭',
        newValue ? 'success' : 'warning',
        1800
      );

      // ★ 关键：统一调用 registerMenus() 重注册全部菜单
      //   registerMenus() 内部会先 unregisterMenus() 注销「修改此页参数 + 备份与恢复」两个，
      //   再按「① 修改此页参数 ② 备份与恢复」的固定顺序重注册，彻底保证顺序永远不变
      if (hasGmApi()) {
        registerMenus(hostname);
      }
    } finally {
      setTimeout(() => { _toggleCallbackLock = false; }, 120);
    }
  };

  try {
    toggleMenuId = GM_registerMenuCommand(menuText, onClick, {
      image: DATA_URLS.rabbit || '',
      autoClose: true,
    });
  } catch (e) {
    // 老版本 Violentmonkey 降级
    try { toggleMenuId = GM_registerMenuCommand(menuText, onClick); } catch (err) {}
  }
}

/**
 * 注册「备份与恢复」菜单项
 */
function registerBackupMenu() {
  if (!hasGmApi()) return;
  try {
    backupMenuId = GM_registerMenuCommand('🐰 RUP：💾 备份与恢复', function () {
      eventBus.emit('rup:open-backup', {});
    }, {
      image: DATA_URLS.disk,
      autoClose: true,
    });
  } catch (e) {
    try {
      backupMenuId = GM_registerMenuCommand('🐰 RUP：💾 备份与恢复', function () {
        eventBus.emit('rup:open-backup', {});
      });
    } catch (err) {}
  }
}

/**
 * 对外 API：注册所有 RUP 菜单（支持反复调用以刷新状态）
 */
export function registerMenus(currentHostname) {
  registeredHostname = currentHostname;
  unregisterMenus();
  registerToggleMenu(currentHostname);
  registerBackupMenu();
}

/**
 * 强制刷新菜单（配置导入后等场景）
 */
export function refreshMenus() {
  if (registeredHostname) registerMenus(registeredHostname);
}

export { svgToDataUrl, DATA_URLS };
