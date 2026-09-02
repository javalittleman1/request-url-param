import { isDomainEnabled, setDomainEnabled } from '../storage/index.js';
import { eventBus } from '../utils/eventBus.js';

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

export function registerMenus(currentHostname) {
  const enabled = isDomainEnabled(currentHostname);
  const menuText = enabled
    ? '🐰 RUP: 🟢🖊️ [绿笔] 修改此页参数'
    : '🐰 RUP: ⚫🖊️ [黑笔] 修改此页参数';

  if (typeof GM_registerMenuCommand === 'function') {
    GM_registerMenuCommand(menuText, function () {
      const currEnabled = isDomainEnabled(currentHostname);
      const newValue = !currEnabled;
      setDomainEnabled(currentHostname, newValue);
      eventBus.emit('rup:domain-toggle', { hostname: currentHostname, enabled: newValue });
      if (typeof GM_notification === 'function') {
        const tip = newValue ? '🟢 绿笔模式已启用' : '⚫ 黑笔模式已禁用';
        GM_notification({
          text: tip,
          title: 'RUP 提示',
          timeout: 2000
        });
      }
    });

    GM_registerMenuCommand('🐰 RUP: 💾 备份与恢复', function () {
      eventBus.emit('rup:open-backup', {});
    });
  }
}
