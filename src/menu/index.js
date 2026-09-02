import { isDomainEnabled, setDomainEnabled } from '../storage/index.js';
import { eventBus } from '../utils/eventBus.js';
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

/**
 * Unicode 实心圆符号（作为状态圆点图标）
 * Tampermonkey 支持菜单项文本里的简单样式，这里用颜色标记前缀更直观
 */
const DOT_BLACK = '⚫';  // 黑色实心圆（U+26AB）
const DOT_GREEN = '🟢';  // 绿色实心圆（U+1F7E2）

// 将 SVG 字符串转为 data:image 数据 URL（给「备份与恢复」用）
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
    if (toggleMenuId !== null) {
      GM_unregisterMenuCommand(toggleMenuId);
    }
    if (backupMenuId !== null) {
      GM_unregisterMenuCommand(backupMenuId);
    }
  } catch (e) { /* 静默 */ }
  toggleMenuId = null;
  backupMenuId = null;
}

/**
 * 注册/重注册单个「修改此页参数」切换菜单项
 * 使用 Unicode 实心圆（黑/绿）+ 明确状态文字（已禁用/已启用）
 * 点击后注销 → 立即重注册，下次看到菜单就是新状态
 */
function registerToggleMenu(hostname) {
  if (!hasGmApi()) return;
  const enabled = isDomainEnabled(hostname);

  // 菜单文字（实心圆前缀 + 状态后缀）
  const statusDot = enabled ? DOT_GREEN : DOT_BLACK;
  const statusText = enabled ? '已启用' : '已禁用';
  const menuText = `🐰 RUP：${statusDot} 修改此页参数（${statusText}）`;

  const onClick = function () {
    // 1. 取反状态 → 持久化 → 发事件
    const currEnabled = isDomainEnabled(hostname);
    const newValue = !currEnabled;
    setDomainEnabled(hostname, newValue);
    eventBus.emit('rup:domain-toggle', { hostname, enabled: newValue });

    // 2. 通知
    if (typeof GM_notification === 'function') {
      try {
        GM_notification({
          text: newValue ? '🟢 已启用：修改参数功能打开' : '⚫ 已禁用：修改参数功能关闭',
          title: 'RUP 提示',
          timeout: 2000,
          highlight: true,
        });
      } catch (e) { /* 静默 */ }
    }

    // 3. 关键：注销当前菜单 → 立即以新状态重注册（确保下次打开菜单显示新颜色和新状态）
    if (hasGmApi()) {
      try { GM_unregisterMenuCommand(toggleMenuId); } catch (e) {}
      toggleMenuId = null;
      registerToggleMenu(hostname);
    }
  };

  try {
    // image 传 dataURL（传兔子当通用装饰，真正的状态标识靠文字里的 ● 颜色）
    toggleMenuId = GM_registerMenuCommand(menuText, onClick, {
      image: DATA_URLS.rabbit || '',
      autoClose: true,
    });
  } catch (e) {
    // 老版本 Violentmonkey 不支持第三参
    try {
      toggleMenuId = GM_registerMenuCommand(menuText, onClick);
    } catch (err) { /* 忽略 */ }
  }
}

/**
 * 注册「备份与恢复」菜单项（仅一个，状态不切换）
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
    } catch (err) { /* 忽略 */ }
  }
}

/**
 * 对外 API：一次性注册所有 RUP 菜单
 * 多次调用会先注销再重注册，保证安全
 */
export function registerMenus(currentHostname) {
  registeredHostname = currentHostname;
  unregisterMenus();
  registerToggleMenu(currentHostname);
  registerBackupMenu();
}

/**
 * 对外暴露：外部强制刷新菜单状态（例如配置被导入覆盖后）
 */
export function refreshMenus() {
  if (registeredHostname) registerMenus(registeredHostname);
}

// 导出工具函数方便复用
export { svgToDataUrl, DATA_URLS };
