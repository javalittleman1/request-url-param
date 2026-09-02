import { isDomainEnabled, setDomainEnabled } from '../storage/index.js';
import { eventBus } from '../utils/eventBus.js';
import iconPenBlack from '../assets/icons/iconPenBlack.js';
import iconPenGreen from '../assets/icons/iconPenGreen.js';
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

// 将 SVG 字符串（单引号或双引号包裹的 <svg>）转为 data:image 数据 URL
// Tampermonkey GM_registerMenuCommand 的 image 参数要求 16x16 大小的 data URI
function svgToDataUrl(svgString, size = 16) {
  if (!svgString || typeof svgString !== 'string') return '';
  // 尝试给根 <svg> 增加 width/height 16（若已有则覆盖）
  let svg = svgString.trim();
  // 去除宽高属性后追加 size
  svg = svg
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
  penBlack: svgToDataUrl(iconPenBlack, 16),
  penGreen: svgToDataUrl(iconPenGreen, 16),
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
 * 同一个菜单项在启用/禁用时图标和文字会在点击后立即刷新
 */
function registerToggleMenu(hostname) {
  if (!hasGmApi()) return;
  const enabled = isDomainEnabled(hostname);
  const menuText = enabled
    ? '🐰 RUP：[绿笔] 修改此页参数（启用）'
    : '🐰 RUP：[黑笔] 修改此页参数（禁用）';
  const image = enabled ? DATA_URLS.penGreen : DATA_URLS.penBlack;
  try {
    toggleMenuId = GM_registerMenuCommand(menuText, function () {
      // 1. 读实际状态 → 取反 → 持久化 → 发事件
      const currEnabled = isDomainEnabled(hostname);
      const newValue = !currEnabled;
      setDomainEnabled(hostname, newValue);
      eventBus.emit('rup:domain-toggle', { hostname, enabled: newValue });

      // 2. 通知
      if (typeof GM_notification === 'function') {
        try {
          GM_notification({
            text: newValue ? '🟢 绿笔模式已启用' : '⚫ 黑笔模式已禁用',
            title: 'RUP 提示',
            timeout: 2000,
            highlight: true,
          });
        } catch (e) { /* 静默 */ }
      }

      // 3. ★ 关键：注销当前菜单项 → 以新状态立即重注册同一菜单
      //    这样用户点击一次后，再次打开 Tampermonkey 菜单就能看到黑笔/绿笔已切换
      if (hasGmApi()) {
        try { GM_unregisterMenuCommand(toggleMenuId); } catch (e) {}
        toggleMenuId = null;
        registerToggleMenu(hostname);
      }
    }, {
      image: image,
      autoClose: true,
    });
  } catch (e) {
    // 某些老版本 Violentmonkey 不支持第三个参数对象
    try {
      toggleMenuId = GM_registerMenuCommand(menuText, function () {
        const currEnabled = isDomainEnabled(hostname);
        const newValue = !currEnabled;
        setDomainEnabled(hostname, newValue);
        eventBus.emit('rup:domain-toggle', { hostname, enabled: newValue });
        if (hasGmApi()) {
          try { GM_unregisterMenuCommand(toggleMenuId); } catch (err) {}
          toggleMenuId = null;
          registerToggleMenu(hostname);
        }
      });
    } catch (err) { /* 彻底失败则忽略 */ }
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
    // 老环境降级
    try {
      backupMenuId = GM_registerMenuCommand('🐰 RUP：💾 备份与恢复', function () {
        eventBus.emit('rup:open-backup', {});
      });
    } catch (err) { /* 忽略 */ }
  }
}

/**
 * 对外 API：一次性注册所有 RUP 菜单（调用时传入当前 hostname）
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

// 导出 dataURL 构造函数方便其他模块复用
export { svgToDataUrl, DATA_URLS };
