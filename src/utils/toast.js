/**
 * 页面内轻量 Toast 提示（替换原 GM_notification，避免篡改猴系统通知因多实例重复堆叠）
 * - 注入一次 DOM，多次调用时只更新内容 + 重置倒计时
 * - 单例模式，整个页面最多 1 条 toast，绝对不会出现 2 条重复提示
 */
let toastEl = null;
let toastTimer = null;

function ensureToastEl() {
  if (toastEl) return toastEl;
  if (typeof document === 'undefined') return null;
  toastEl = document.createElement('div');
  toastEl.id = 'rup-toast';
  // 用 all:initial 重置宿主页面样式污染
  toastEl.setAttribute('style', 'all:initial;');
  const rootStyle = [
    'position:fixed',
    'top:24px',
    'left:50%',
    'transform:translateX(-50%) translateY(-20px)',
    'z-index:2147483647',
    'padding:10px 18px',
    'border-radius:10px',
    'font-size:14px',
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"PingFang SC","Microsoft YaHei",sans-serif',
    'color:#fff',
    'box-shadow:0 6px 20px rgba(0,0,0,0.22)',
    'background:rgba(30,30,30,0.92)',
    'border:1px solid rgba(255,255,255,0.08)',
    'opacity:0',
    'pointer-events:none',
    'transition:transform .25s ease, opacity .2s ease',
    'line-height:1.5',
    'letter-spacing:0.2px',
    'backdrop-filter:blur(6px)',
    'white-space:nowrap',
    'user-select:none',
  ].join(' !important; ') + ' !important;';
  toastEl.style.cssText = rootStyle;
  document.documentElement.appendChild(toastEl);
  return toastEl;
}

/**
 * 弹出单例 Toast
 * @param {string} message  文字
 * @param {'success' | 'warning' | 'info' | 'error'} [type='info']
 * @param {number} [timeoutMs=2000]
 */
export function showToast(message, type = 'info', timeoutMs = 2000) {
  if (!message || typeof message !== 'string') return;
  const el = ensureToastEl();
  if (!el) return;

  // 类型颜色
  const bgMap = {
    success: 'linear-gradient(135deg,#22c55e,#16a34a)',
    warning: 'linear-gradient(135deg,#f59e0b,#d97706)',
    error:   'linear-gradient(135deg,#ef4444,#dc2626)',
    info:    'rgba(30,30,30,0.92)',
  };
  const bg = bgMap[type] || bgMap.info;

  el.textContent = message;
  el.style.background = bg;

  // 强制重绘后淡入
  void el.offsetWidth;
  el.style.opacity = '1';
  el.style.transform = 'translateX(-50%) translateY(0)';

  // 重置/覆盖上一次定时器（新消息进来 → 旧的倒计时立刻作废，用新消息的超时）
  if (toastTimer) {
    clearTimeout(toastTimer);
    toastTimer = null;
  }
  toastTimer = setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-50%) translateY(-20px)';
    toastTimer = setTimeout(() => {
      try {
        if (toastEl && toastEl.parentNode) toastEl.parentNode.removeChild(toastEl);
      } catch (e) {}
      toastEl = null;
      toastTimer = null;
    }, 300);
  }, timeoutMs);
}

/**
 * 手动关闭 Toast（如果有）
 */
export function hideToast() {
  if (toastTimer) { clearTimeout(toastTimer); toastTimer = null; }
  if (toastEl) {
    toastEl.style.opacity = '0';
    toastEl.style.transform = 'translateX(-50%) translateY(-20px)';
    setTimeout(() => {
      try { if (toastEl && toastEl.parentNode) toastEl.parentNode.removeChild(toastEl); } catch (e) {}
      toastEl = null;
    }, 300);
  }
}
