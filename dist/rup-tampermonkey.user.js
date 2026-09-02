// ==UserScript==
// @name         RUP - 请求URL参数修改
// @namespace    npm/rup-tampermonkey
// @version      0.2.0
// @icon         data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='body' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23FF6B9D'/%3E%3Cstop offset='100%25' stop-color='%23FF8E53'/%3E%3C/linearGradient%3E%3ClinearGradient id='ear' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23FF8E53'/%3E%3Cstop offset='100%25' stop-color='%23FF6B9D'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cellipse cx='50' cy='62' rx='22' ry='20' fill='url(%23body)' stroke='white' stroke-width='2.5'/%3E%3Cpath d='M32 48 Q28 22 35 18 Q40 20 42 45 Z' fill='url(%23ear)' stroke='white' stroke-width='2.5'/%3E%3Cpath d='M58 48 Q62 22 55 18 Q50 20 48 45 Z' fill='url(%23ear)' stroke='white' stroke-width='2.5'/%3E%3Ccircle cx='43' cy='58' r='3.5' fill='white'/%3E%3Ccircle cx='57' cy='58' r='3.5' fill='white'/%3E%3Ccircle cx='44' cy='58' r='1.8' fill='%23333'/%3E%3Ccircle cx='58' cy='58' r='1.8' fill='%23333'/%3E%3Cellipse cx='50' cy='68' rx='3' ry='2' fill='%23FFB6C1' stroke='white' stroke-width='1.2'/%3E%3Cpath d='M72 60 Q82 52 88 58 Q84 62 75 64 Z' fill='%23FF6B9D' stroke='white' stroke-width='2.5'/%3E%3Cpath d='M36 80 Q32 90 28 92 Q36 88 42 82 Z' fill='url(%23body)' stroke='white' stroke-width='2'/%3E%3Cpath d='M64 80 Q68 90 72 92 Q64 88 58 82 Z' fill='url(%23body)' stroke='white' stroke-width='2'/%3E%3Ccircle cx='50' cy='40' r='3' fill='%23FFD700'/%3E%3Cpath d='M45 38 L43 30 M55 38 L57 30' stroke='%23FFD700' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E
// @homepageURL  https://github.com/javalittleman1/request-url-param
// @supportURL   https://github.com/javalittleman1/request-url-param/issues
// @downloadURL  https://raw.githubusercontent.com/javalittleman1/request-url-param/master/dist/rup-tampermonkey.user.js
// @updateURL    https://raw.githubusercontent.com/javalittleman1/request-url-param/master/dist/rup-tampermonkey.user.js
// @match        *://*/*
// @require      https://cdn.jsdelivr.net/npm/vue@3.5.42/dist/vue.global.prod.js
// @grant        GM_addStyle
// @grant        GM_deleteValue
// @grant        GM_getValue
// @grant        GM_listValues
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_unregisterMenuCommand
// @noframes
// ==/UserScript==

(function(vue) {
	"use strict";
	var s = new Set();
	var _css = async (t) => {
		if (s.has(t)) return;
		s.add(t);
		((c) => {
			if (typeof GM_addStyle === "function") GM_addStyle(c);
			else (document.head || document.documentElement).appendChild(document.createElement("style")).append(c);
		})(t);
	};
	_css(" .rup-fab[data-v-3f5a5d6b]{z-index:2147483600;font-size:0;line-height:0;position:fixed;bottom:32px;right:32px}.rup-fab__inner[data-v-3f5a5d6b]{flex-direction:row;justify-content:flex-end;align-items:center;gap:8px;display:flex;position:relative}.rup-fab__main[data-v-3f5a5d6b],.rup-fab__sub[data-v-3f5a5d6b]{cursor:pointer;border:none;border-radius:50%;justify-content:center;align-items:center;width:52px;height:52px;padding:0;transition:all .2s;display:flex;overflow:hidden;box-shadow:0 4px 16px #0003}.rup-fab__main[data-v-3f5a5d6b]{color:#fff;background:linear-gradient(135deg,#ff6b9d,#ff8e53)}.rup-fab__main[data-v-3f5a5d6b]:hover{transform:scale(1.05)}.rup-fab__sub[data-v-3f5a5d6b]{color:#333;opacity:0;pointer-events:none;background:#fff;border:1px solid #e5e7eb;transition-duration:.25s;transform:translate(calc(100% + 8px))}.rup-fab:hover .rup-fab__sub[data-v-3f5a5d6b]{opacity:1;pointer-events:auto;transform:translate(0)}.rup-fab__icon[data-v-3f5a5d6b]{justify-content:center;align-items:center;width:28px;height:28px;line-height:1;display:inline-flex}.rup-fab__icon[data-v-3f5a5d6b] svg,.rup-fab__icon svg[data-v-3f5a5d6b]{min-width:28px;min-height:28px;width:28px!important;height:28px!important;display:block!important}.rup-panels[data-v-854ea750]{grid-template-columns:1fr 1fr;gap:20px;height:100%;display:grid}.rup-panel[data-v-854ea750]{flex-direction:column;min-height:0;display:flex}.rup-panel h4[data-v-854ea750]{align-items:center;margin:0 0 12px;font-size:14px;font-weight:600;display:flex}.rup-add-btn[data-v-854ea750]{color:#4f46e5;cursor:pointer;-webkit-user-select:none;user-select:none;background:#eef2ff;border-radius:6px;margin-left:8px;padding:4px 10px;font-size:12px;display:inline-block}.rup-add-btn[data-v-854ea750]:hover{background:#e0e7ff}.rup-list[data-v-854ea750]{flex:1;margin:0;padding:0;list-style:none;overflow-y:auto}.rup-list li[data-v-854ea750]{border-radius:6px;margin-bottom:4px;padding:8px 10px;font-size:13px}.rup-panel--left .rup-list li[data-v-854ea750]{cursor:pointer;outline-offset:-1px;outline:2px solid #0000;transition:background .15s,box-shadow .15s,transform .15s,outline .15s}.rup-panel--left .rup-list li[data-v-854ea750]:hover{background:#f5f5f7}.rup-panel--left .rup-list li.rup-item--selected[data-v-854ea750]{color:#2563eb;font-weight:700}.rup-panel--left .rup-list li.rup-item--focused[data-v-854ea750]{outline-offset:2px;z-index:2;background:#eef2ff;border-radius:8px;outline:2px solid #4f46e5;position:relative;box-shadow:0 0 0 3px #4f46e52e}.rup-panel--left .rup-list li.rup-item--flash[data-flash-key][data-v-854ea750]{animation:.72s cubic-bezier(.4,0,.2,1) both rup-flash-854ea750}@keyframes rup-flash-854ea750{0%{background-color:#fef3c7;transform:scale(1);box-shadow:0 0 #fbbf2480}35%{background-color:#fde68a;transform:scale(1.025);box-shadow:0 0 0 6px #fbbf2438}to{background-color:#0000;transform:scale(1);box-shadow:0 0 #fbbf2400}}.rup-panel--left .rup-list li.rup-item--focused.rup-item--flash[data-flash-key][data-v-854ea750]{animation-name:rup-flash-keep-focus-854ea750}@keyframes rup-flash-keep-focus-854ea750{0%{background-color:#fef3c7;transform:scale(1);box-shadow:0 0 #fbbf2480}35%{background-color:#fde68a;transform:scale(1.025);box-shadow:0 0 0 6px #fbbf2438}to{background-color:#eef2ff;transform:scale(1);box-shadow:0 0 0 3px #4f46e52e}}.rup-key[data-v-854ea750]{margin-right:6px;font-weight:700}.rup-eq[data-v-854ea750]{color:#999;margin-right:4px}.rup-val[data-v-854ea750]{color:#666;word-break:break-all}.rup-modify-item[data-v-854ea750]{background:#fafafa;border:1px solid #f0f0f0;align-items:center;gap:6px;display:flex;padding:6px!important}.inp-key[data-v-854ea750],.inp-val[data-v-854ea750]{background:#fff;border:1px solid #e5e7eb;border-radius:4px;outline:none;padding:6px 8px;font-size:13px}.inp-key[data-v-854ea750]:focus,.inp-val[data-v-854ea750]:focus{border-color:#4f46e5;box-shadow:0 0 0 2px #4f46e51a}.inp-key[data-v-854ea750]{width:40%}.inp-val[data-v-854ea750]{flex:1}.btn-del[data-v-854ea750]{color:#ef4444;cursor:pointer;background:#fef2f2;border:none;border-radius:4px;flex-shrink:0;justify-content:center;align-items:center;width:28px;height:28px;font-size:14px;display:flex}.btn-del[data-v-854ea750]:hover{background:#fee2e2}.rup-empty[data-v-854ea750]{text-align:center;color:#999;background:#fafafa;font-size:12px;padding:20px 10px!important}.rup-mask[data-v-1dda74c6]{z-index:2147483601;background:#00000073;position:fixed;inset:0}.rup-dialog[data-v-1dda74c6]{z-index:2147483602;background:#fff;border-radius:12px;width:820px;max-width:95vw;max-height:85vh;position:fixed;top:50%;left:50%;overflow:hidden;transform:translate(-50%,-50%);box-shadow:0 10px 40px #0003}.rup-dialog__header[data-v-1dda74c6]{border-bottom:1px solid #eee;justify-content:space-between;align-items:center;padding:16px 20px;display:flex}.rup-dialog__header h3[data-v-1dda74c6]{margin:0;font-size:16px;font-weight:600}.rup-close[data-v-1dda74c6]{cursor:pointer;color:#666;-webkit-user-select:none;user-select:none;font-size:20px}.rup-close[data-v-1dda74c6]:hover{color:#333}.rup-dialog__body[data-v-1dda74c6]{height:calc(85vh - 140px);padding:20px;overflow:auto}.rup-dialog__footer[data-v-1dda74c6]{border-top:1px solid #eee;justify-content:space-between;align-items:center;padding:12px 20px;display:flex}.rup-footer__left[data-v-1dda74c6]{flex-direction:column;gap:8px;display:flex}.rup-strategy-row[data-v-1dda74c6]{align-items:center;gap:8px;display:flex}.rup-checkbox[data-v-1dda74c6]{cursor:pointer;align-items:center;gap:6px;font-size:14px;display:flex}.rup-checkbox input[type=checkbox][data-v-1dda74c6]{cursor:pointer}.rup-tip[data-v-1dda74c6]{color:#666;font-size:12px}.rup-strategy-label[data-v-1dda74c6]{font-size:14px}.rup-radio-group[data-v-1dda74c6]{gap:16px;display:flex}.rup-radio[data-v-1dda74c6]{cursor:pointer;align-items:center;gap:4px;font-size:14px;display:flex}.rup-radio input[type=radio][data-v-1dda74c6]{cursor:pointer}.rup-footer__right[data-v-1dda74c6]{gap:10px;display:flex}.rup-btn[data-v-1dda74c6]{cursor:pointer;border:none;border-radius:6px;padding:8px 18px;font-size:14px;transition:all .2s}.rup-btn--secondary[data-v-1dda74c6]{color:#333;background:#fff;border:1px solid #ddd}.rup-btn--secondary[data-v-1dda74c6]:hover{background:#f5f5f5}.rup-btn--primary[data-v-1dda74c6]{color:#fff;background:#4f46e5}.rup-btn--primary[data-v-1dda74c6]:hover{background:#4338ca}.rup-mask[data-v-9ee4b870]{z-index:2147483601;background:#00000073;position:fixed;inset:0}.rup-dialog[data-v-9ee4b870]{z-index:2147483602;background:#fff;border-radius:12px;width:820px;max-width:95vw;max-height:85vh;position:fixed;top:50%;left:50%;overflow:hidden;transform:translate(-50%,-50%);box-shadow:0 10px 40px #0003}.rup-dialog__header[data-v-9ee4b870]{border-bottom:1px solid #eee;justify-content:space-between;align-items:center;padding:16px 20px;display:flex}.rup-dialog__header h3[data-v-9ee4b870]{margin:0;font-size:16px;font-weight:600}.rup-close[data-v-9ee4b870]{cursor:pointer;color:#666;-webkit-user-select:none;user-select:none;font-size:20px}.rup-close[data-v-9ee4b870]:hover{color:#333}.rup-dialog__body[data-v-9ee4b870]{height:calc(85vh - 140px);padding:20px;overflow:auto}.rup-dialog__footer[data-v-9ee4b870]{border-top:1px solid #eee;justify-content:space-between;align-items:center;padding:12px 20px;display:flex}.rup-footer__left[data-v-9ee4b870]{flex-direction:column;gap:8px;display:flex}.rup-footer__right[data-v-9ee4b870]{gap:10px;display:flex}.rup-btn[data-v-9ee4b870]{cursor:pointer;border:none;border-radius:6px;padding:8px 18px;font-size:14px;transition:all .2s}.rup-btn--secondary[data-v-9ee4b870]{color:#333;background:#fff;border:1px solid #ddd}.rup-btn--secondary[data-v-9ee4b870]:hover{background:#f5f5f5}.rup-export-section[data-v-9ee4b870]{background:#f9fafb;border-radius:8px;margin-bottom:16px;padding:16px}.rup-import-section[data-v-9ee4b870]{background:#f0f9ff;border-radius:8px;padding:16px}.rup-section-title[data-v-9ee4b870]{margin-top:0;margin-bottom:12px;font-size:15px;font-weight:600}.rup-details[data-v-9ee4b870]{margin-bottom:4px}.rup-summary[data-v-9ee4b870]{cursor:pointer;color:#374151;padding:6px 0;font-size:14px}.rup-summary[data-v-9ee4b870]:hover{color:#111827}.rup-textarea[data-v-9ee4b870]{resize:none;box-sizing:border-box;border:1px solid #e5e7eb;border-radius:6px;width:100%;height:200px;margin-top:8px;padding:8px;font-family:Consolas,monospace;font-size:12px}.rup-btn--export[data-v-9ee4b870]{color:#fff;cursor:pointer;background:#16a34a;border:none;border-radius:6px;margin-top:12px;padding:8px 16px;font-size:14px}.rup-btn--export[data-v-9ee4b870]:hover{background:#15803d}.rup-alert[data-v-9ee4b870]{border-radius:6px;margin-bottom:12px;padding:10px 14px;font-size:14px}.rup-alert--error[data-v-9ee4b870]{color:#b91c1c;background:#fef2f2}.rup-alert--success[data-v-9ee4b870]{color:#047857;background:#ecfdf5}.rup-dropzone[data-v-9ee4b870]{cursor:pointer;box-sizing:border-box;background:#fff;border:2px dashed #0ea5e9;border-radius:10px;flex-direction:column;justify-content:center;align-items:center;width:100%;height:120px;transition:all .2s;display:flex}.rup-dropzone[data-v-9ee4b870]:hover{background:#f0f9ff}.rup-dropzone--hover[data-v-9ee4b870]{background:#f0f9ff;border-color:#0369a1}.rup-dropzone__text1[data-v-9ee4b870]{font-size:18px}.rup-dropzone__text2[data-v-9ee4b870]{color:#64748b;margin-top:6px;font-size:12px}\n/*$vite$:1*/ ");
	var STORAGE_KEY = "rup_full_config";
	function getDefaultFullConfig() {
		return {
			enabledDomains: [],
			domainConfigs: {}
		};
	}
	function getDefaultDomainConfig() {
		return {
			modifyList: [],
			strategy: "match_only",
			removeEmpty: false
		};
	}
	function hasGM() {
		return typeof GM_setValue === "function" && typeof GM_getValue === "function" && typeof GM_deleteValue === "function";
	}
	function storageGet(key, defaultValue) {
		if (hasGM()) return GM_getValue(key, defaultValue);
		try {
			const raw = localStorage.getItem(key);
			if (raw === null) return defaultValue;
			return JSON.parse(raw);
		} catch {
			return defaultValue;
		}
	}
	function storageSet(key, value) {
		if (hasGM()) GM_setValue(key, value);
		else try {
			localStorage.setItem(key, JSON.stringify(value));
		} catch {}
	}
	function getFullConfig() {
		const cfg = storageGet(STORAGE_KEY, null);
		if (!cfg || typeof cfg !== "object") return getDefaultFullConfig();
		if (!Array.isArray(cfg.enabledDomains)) cfg.enabledDomains = [];
		if (!cfg.domainConfigs || typeof cfg.domainConfigs !== "object") cfg.domainConfigs = {};
		return cfg;
	}
	function setFullConfig(cfg) {
		if (!cfg || typeof cfg !== "object") cfg = getDefaultFullConfig();
		storageSet(STORAGE_KEY, cfg);
	}
	function getConfig(hostname) {
		const cfg = getFullConfig().domainConfigs[hostname];
		if (!cfg || typeof cfg !== "object") return getDefaultDomainConfig();
		const result = {
			modifyList: Array.isArray(cfg.modifyList) ? cfg.modifyList : [],
			strategy: [
				"match_only",
				"list_only",
				"match_and_diff"
			].includes(cfg.strategy) ? cfg.strategy : "match_only",
			removeEmpty: !!cfg.removeEmpty
		};
		if (cfg.lastUrl !== void 0) result.lastUrl = cfg.lastUrl;
		return result;
	}
	function saveConfig(hostname, cfg) {
		const full = getFullConfig();
		full.domainConfigs[hostname] = {
			modifyList: Array.isArray(cfg.modifyList) ? cfg.modifyList : [],
			strategy: [
				"match_only",
				"list_only",
				"match_and_diff"
			].includes(cfg.strategy) ? cfg.strategy : "match_only",
			removeEmpty: !!cfg.removeEmpty
		};
		if (cfg.lastUrl !== void 0) full.domainConfigs[hostname].lastUrl = cfg.lastUrl;
		setFullConfig(full);
	}
	function setDomainEnabled(hostname, enabled) {
		const full = getFullConfig();
		const idx = full.enabledDomains.indexOf(hostname);
		if (enabled && idx === -1) full.enabledDomains.push(hostname);
		else if (!enabled && idx !== -1) full.enabledDomains.splice(idx, 1);
		setFullConfig(full);
	}
	function isDomainEnabled(hostname) {
		return getFullConfig().enabledDomains.includes(hostname);
	}
	var eventMap = new Map();
	function on(event, handler) {
		if (!eventMap.has(event)) eventMap.set(event, new Set());
		eventMap.get(event).add(handler);
	}
	function off(event, handler) {
		const handlers = eventMap.get(event);
		if (!handlers) return;
		if (handler) handlers.delete(handler);
		else handlers.clear();
	}
	function emit(event, ...args) {
		const handlers = eventMap.get(event);
		if (!handlers) return;
		for (const handler of handlers) try {
			handler(...args);
		} catch (e) {
			console.error(e);
		}
	}
	var eventBus = {
		on,
		off,
		emit
	};
	var toastEl = null;
	var toastTimer = null;
	function ensureToastEl() {
		if (toastEl) return toastEl;
		if (typeof document === "undefined") return null;
		toastEl = document.createElement("div");
		toastEl.id = "rup-toast";
		toastEl.setAttribute("style", "all:initial;");
		const rootStyle = [
			"position:fixed",
			"top:24px",
			"left:50%",
			"transform:translateX(-50%) translateY(-20px)",
			"z-index:2147483647",
			"padding:10px 18px",
			"border-radius:10px",
			"font-size:14px",
			"font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,\"PingFang SC\",\"Microsoft YaHei\",sans-serif",
			"color:#fff",
			"box-shadow:0 6px 20px rgba(0,0,0,0.22)",
			"background:rgba(30,30,30,0.92)",
			"border:1px solid rgba(255,255,255,0.08)",
			"opacity:0",
			"pointer-events:none",
			"transition:transform .25s ease, opacity .2s ease",
			"line-height:1.5",
			"letter-spacing:0.2px",
			"backdrop-filter:blur(6px)",
			"white-space:nowrap",
			"user-select:none"
		].join(" !important; ") + " !important;";
		toastEl.style.cssText = rootStyle;
		document.documentElement.appendChild(toastEl);
		return toastEl;
	}
	function showToast(message, type = "info", timeoutMs = 2e3) {
		if (!message || typeof message !== "string") return;
		const el = ensureToastEl();
		if (!el) return;
		const bgMap = {
			success: "linear-gradient(135deg,#22c55e,#16a34a)",
			warning: "linear-gradient(135deg,#f59e0b,#d97706)",
			error: "linear-gradient(135deg,#ef4444,#dc2626)",
			info: "rgba(30,30,30,0.92)"
		};
		const bg = bgMap[type] || bgMap.info;
		el.textContent = message;
		el.style.background = bg;
		el.offsetWidth;
		el.style.opacity = "1";
		el.style.transform = "translateX(-50%) translateY(0)";
		if (toastTimer) {
			clearTimeout(toastTimer);
			toastTimer = null;
		}
		toastTimer = setTimeout(() => {
			el.style.opacity = "0";
			el.style.transform = "translateX(-50%) translateY(-20px)";
			toastTimer = setTimeout(() => {
				try {
					if (toastEl && toastEl.parentNode) toastEl.parentNode.removeChild(toastEl);
				} catch (e) {}
				toastEl = null;
				toastTimer = null;
			}, 300);
		}, timeoutMs);
	}
	var iconDisk_default = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" width=\"24\" height=\"24\"><rect x=\"6\" y=\"8\" width=\"52\" height=\"48\" rx=\"4\" fill=\"#333\" stroke=\"#111\" stroke-width=\"1.5\"/><rect x=\"14\" y=\"8\" width=\"36\" height=\"18\" fill=\"#666\"/><rect x=\"18\" y=\"12\" width=\"28\" height=\"10\" fill=\"#333\"/><circle cx=\"32\" cy=\"42\" r=\"10\" fill=\"#666\"/><circle cx=\"32\" cy=\"42\" r=\"4\" fill=\"#333\"/><rect x=\"26\" y=\"40\" width=\"12\" height=\"4\" rx=\"1\" fill=\"#999\"/><circle cx=\"50\" y=\"18\" r=\"2\" fill=\"#22c55e\"/></svg>";
	var iconRabbit_default = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" width=\"24\" height=\"24\"><defs><linearGradient id=\"rb\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"100%\"><stop offset=\"0%\" stop-color=\"#FF6B9D\"/><stop offset=\"100%\" stop-color=\"#FF8E53\"/></linearGradient></defs><path d=\"M20 10 Q18 4 23 3 Q29 2 30 12 L28 18\" fill=\"url(#rb)\" stroke=\"#fff\" stroke-width=\"1.5\" stroke-linejoin=\"round\"/><path d=\"M44 10 Q46 4 41 3 Q35 2 34 12 L36 18\" fill=\"url(#rb)\" stroke=\"#fff\" stroke-width=\"1.5\" stroke-linejoin=\"round\"/><ellipse cx=\"32\" cy=\"38\" rx=\"18\" ry=\"16\" fill=\"url(#rb)\" stroke=\"#fff\" stroke-width=\"2\"/><circle cx=\"25\" cy=\"36\" r=\"3\" fill=\"#fff\"/><circle cx=\"39\" cy=\"36\" r=\"3\" fill=\"#fff\"/><circle cx=\"25.5\" cy=\"36.5\" r=\"1.6\" fill=\"#333\"/><circle cx=\"39.5\" cy=\"36.5\" r=\"1.6\" fill=\"#333\"/><ellipse cx=\"32\" cy=\"43\" rx=\"2.2\" ry=\"1.4\" fill=\"#FFB6C1\" stroke=\"#fff\" stroke-width=\"1\"/><path d=\"M30 45 Q32 48 34 45\" fill=\"none\" stroke=\"#fff\" stroke-width=\"1.2\" stroke-linecap=\"round\"/><path d=\"M50 34 Q58 28 60 34 Q56 38 50 38\" fill=\"url(#rb)\" stroke=\"#fff\" stroke-width=\"1.8\" stroke-linejoin=\"round\"/><path d=\"M22 52 Q18 58 14 60 Q22 58 28 54\" fill=\"url(#rb)\" stroke=\"#fff\" stroke-width=\"1.5\"/><path d=\"M42 52 Q46 58 50 60 Q42 58 36 54\" fill=\"url(#rb)\" stroke=\"#fff\" stroke-width=\"1.5\"/></svg>";
	var STRATEGY_LABELS = {
		match_only: "仅匹配替换",
		list_only: "只使用本修改列表的参数",
		match_and_diff: "匹配替换+差异参数"
	};
	var toggleMenuId = null;
	var backupMenuId = null;
	var registeredHostname = null;
	var _toggleCallbackLock = false;
	var DOT_BLACK = "⚫";
	var DOT_GREEN = "🟢";
	function svgToDataUrl(svgString, size = 16) {
		if (!svgString || typeof svgString !== "string") return "";
		let svg = svgString.trim().replace(/\s+width="[^"]*"/gi, "").replace(/\s+height="[^"]*"/gi, "").replace(/<svg\s+/i, `<svg width="${size}" height="${size}" `);
		try {
			return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg).replace(/'/g, "%27").replace(/"/g, "%22")}`;
		} catch (e) {
			return "";
		}
	}
	var DATA_URLS = {
		disk: svgToDataUrl(iconDisk_default, 16),
		rabbit: svgToDataUrl(iconRabbit_default, 16)
	};
	function hasGmApi() {
		return typeof GM_registerMenuCommand === "function" && typeof GM_unregisterMenuCommand === "function";
	}
	function unregisterMenus() {
		if (!hasGmApi()) return;
		try {
			if (toggleMenuId !== null) GM_unregisterMenuCommand(toggleMenuId);
			if (backupMenuId !== null) GM_unregisterMenuCommand(backupMenuId);
		} catch (e) {}
		toggleMenuId = null;
		backupMenuId = null;
	}
	function registerToggleMenu(hostname) {
		if (!hasGmApi()) return;
		const enabled = isDomainEnabled(hostname);
		const menuText = `🐰 RUP：${enabled ? DOT_GREEN : DOT_BLACK} 修改此页参数（${enabled ? "已启用" : "已禁用"}）`;
		const onClick = function() {
			if (_toggleCallbackLock) return;
			_toggleCallbackLock = true;
			try {
				const currEnabled = isDomainEnabled(hostname);
				const newValue = !currEnabled;
				if (newValue === currEnabled) return;
				setDomainEnabled(hostname, newValue);
				eventBus.emit("rup:domain-toggle", {
					hostname,
					enabled: newValue
				});
				showToast(newValue ? "🟢 已启用：修改参数功能已打开" : "⚫ 已禁用：修改参数功能已关闭", newValue ? "success" : "warning", 1800);
				if (hasGmApi()) registerMenus(hostname);
			} finally {
				setTimeout(() => {
					_toggleCallbackLock = false;
				}, 120);
			}
		};
		try {
			toggleMenuId = GM_registerMenuCommand(menuText, onClick, {
				image: DATA_URLS.rabbit || "",
				autoClose: true
			});
		} catch (e) {
			try {
				toggleMenuId = GM_registerMenuCommand(menuText, onClick);
			} catch (err) {}
		}
	}
	function registerBackupMenu() {
		if (!hasGmApi()) return;
		try {
			backupMenuId = GM_registerMenuCommand("🐰 RUP：💾 备份与恢复", function() {
				eventBus.emit("rup:open-backup", {});
			}, {
				image: DATA_URLS.disk,
				autoClose: true
			});
		} catch (e) {
			try {
				backupMenuId = GM_registerMenuCommand("🐰 RUP：💾 备份与恢复", function() {
					eventBus.emit("rup:open-backup", {});
				});
			} catch (err) {}
		}
	}
	function registerMenus(currentHostname) {
		registeredHostname = currentHostname;
		unregisterMenus();
		registerToggleMenu(currentHostname);
		registerBackupMenu();
	}
	function refreshMenus() {
		if (registeredHostname) registerMenus(registeredHostname);
	}
	var iconFinger_default = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" width=\"24\" height=\"24\"><path d=\"M22 8 Q18 8 18 12 L18 32 Q18 34 20 34 Q22 34 22 32 L22 14 Q22 12 24 12 Q26 12 26 14 L26 34 Q26 36 28 36 Q30 36 30 34 L30 12 Q30 8 26 8 Q22 8 22 8 Z\" fill=\"#fff\" stroke=\"#fff\" stroke-width=\"1\"/><path d=\"M30 8 Q34 8 34 12 L34 30 Q34 32 36 32 Q38 32 38 30 L38 14 Q38 10 34 10\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.5\" stroke-linejoin=\"round\"/><path d=\"M38 18 Q42 16 42 20 L42 30 Q42 32 44 32 Q46 32 46 30 L46 22 Q46 20 44 20\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.5\" stroke-linejoin=\"round\"/><path d=\"M18 32 L18 48 Q18 54 26 56 L40 56 Q50 54 50 44 L50 38 Q48 34 42 34 L40 36 L38 30 Q38 32 36 32 Q34 32 34 30 L30 34 Q30 36 28 36 Q26 36 26 34 L22 32 Q22 34 20 34 Q18 34 18 32 Z\" fill=\"#fff\" stroke=\"#fff\" stroke-width=\"1.5\" stroke-linejoin=\"round\"/></svg>";
	var iconGear_default = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" width=\"24\" height=\"24\"><g fill=\"#333\" stroke=\"#333\" stroke-width=\"0.5\"><path d=\"M32 4 L36 10 L28 10 Z\"/><path d=\"M32 60 L36 54 L28 54 Z\"/><path d=\"M4 32 L10 28 L10 36 Z\"/><path d=\"M60 32 L54 28 L54 36 Z\"/><path d=\"M11 11 L17 13 L13 17 Z\"/><path d=\"M53 53 L47 51 L51 47 Z\"/><path d=\"M11 53 L13 47 L17 51 Z\"/><path d=\"M53 11 L51 17 L47 13 Z\"/></g><circle cx=\"32\" cy=\"32\" r=\"18\" fill=\"#fff\" stroke=\"#333\" stroke-width=\"3\"/><circle cx=\"32\" cy=\"32\" r=\"10\" fill=\"#333\"/><circle cx=\"32\" cy=\"32\" r=\"4\" fill=\"#fff\"/></svg>";
	function parseQuery(url) {
		const result = [];
		if (!url) return result;
		let searchPart = "";
		const hashIdx = url.indexOf("#");
		const withoutHash = hashIdx !== -1 ? url.slice(0, hashIdx) : url;
		const qIdx = withoutHash.indexOf("?");
		if (qIdx !== -1) searchPart = withoutHash.slice(qIdx + 1);
		else if (withoutHash.includes("=") || withoutHash.includes("&")) searchPart = withoutHash;
		if (!searchPart) return result;
		const pairs = searchPart.split("&");
		for (const pair of pairs) {
			if (!pair) continue;
			const eqIdx = pair.indexOf("=");
			let key, value;
			if (eqIdx !== -1) {
				key = pair.slice(0, eqIdx);
				value = pair.slice(eqIdx + 1);
			} else {
				key = pair;
				value = "";
			}
			result.push({
				key: decodeURIComponent(key.replace(/\+/g, " ")),
				value: decodeURIComponent(value.replace(/\+/g, " "))
			});
		}
		return result;
	}
	function buildQuery(params) {
		if (!Array.isArray(params) || params.length === 0) return "";
		const parts = [];
		for (const item of params) {
			if (!item || typeof item.key === "undefined") continue;
			const key = encodeURIComponent(String(item.key)).replace(/%20/g, "+");
			const value = item.value === null || item.value === void 0 ? "" : encodeURIComponent(String(item.value)).replace(/%20/g, "+");
			parts.push(`${key}=${value}`);
		}
		return parts.join("&");
	}
	function applyStrategy(rawUrl, modifyList, strategy, removeEmpty) {
		if (!rawUrl) return rawUrl;
		let hashPart = "";
		const hashIdx = rawUrl.indexOf("#");
		let urlWithoutHash = rawUrl;
		if (hashIdx !== -1) {
			hashPart = rawUrl.slice(hashIdx);
			urlWithoutHash = rawUrl.slice(0, hashIdx);
		}
		let basePart = "";
		let searchPart = "";
		const qIdx = urlWithoutHash.indexOf("?");
		if (qIdx !== -1) {
			basePart = urlWithoutHash.slice(0, qIdx);
			searchPart = urlWithoutHash.slice(qIdx + 1);
		} else basePart = urlWithoutHash;
		const originalParams = parseQuery(searchPart);
		const safeModifyList = Array.isArray(modifyList) ? modifyList : [];
		const safeRemoveEmpty = !!removeEmpty;
		let finalParams = [];
		switch (strategy) {
			case "list_only":
				for (const item of safeModifyList) {
					if (safeRemoveEmpty && (item.value === "" || item.value === null || item.value === void 0)) continue;
					finalParams.push({
						key: item.key,
						value: item.value
					});
				}
				break;
			case "match_only": {
				const modifyMap = new Map();
				for (const item of safeModifyList) {
					if (!modifyMap.has(item.key)) modifyMap.set(item.key, []);
					modifyMap.get(item.key).push(item);
				}
				for (const original of originalParams) {
					const key = original.key;
					if (modifyMap.has(key)) {
						const modifiers = modifyMap.get(key);
						if (modifiers.length > 0) {
							const mod = modifiers.shift();
							if (!safeRemoveEmpty || mod.value !== "" && mod.value !== null && mod.value !== void 0) finalParams.push({
								key,
								value: mod.value
							});
						} else finalParams.push(original);
					} else finalParams.push(original);
				}
				break;
			}
			case "match_and_diff": {
				const modifyMap = new Map();
				for (const item of safeModifyList) {
					if (!modifyMap.has(item.key)) modifyMap.set(item.key, []);
					modifyMap.get(item.key).push(item);
				}
				for (const original of originalParams) {
					const key = original.key;
					if (modifyMap.has(key) && modifyMap.get(key).length > 0) {
						const mod = modifyMap.get(key).shift();
						if (!safeRemoveEmpty || mod.value !== "" && mod.value !== null && mod.value !== void 0) finalParams.push({
							key,
							value: mod.value
						});
					} else finalParams.push(original);
				}
				for (const [key, modifiers] of modifyMap.entries()) for (const mod of modifiers) if (!safeRemoveEmpty || mod.value !== "" && mod.value !== null && mod.value !== void 0) finalParams.push({
					key,
					value: mod.value
				});
				break;
			}
			default: finalParams = originalParams.slice();
		}
		const newQuery = buildQuery(finalParams);
		let result = basePart;
		if (newQuery) result += "?" + newQuery;
		result += hashPart;
		return result;
	}
	var _plugin_vue_export_helper_default = (sfc, props) => {
		const target = sfc.__vccOpts || sfc;
		for (const [key, val] of props) target[key] = val;
		return target;
	};
	var _hoisted_1$3 = { class: "rup-fab" };
	var _hoisted_2$3 = { class: "rup-fab__inner" };
	var _hoisted_3$3 = ["innerHTML"];
	var _hoisted_4$3 = ["innerHTML"];
	var FabRequest_default = _plugin_vue_export_helper_default({
		__name: "FabRequest",
		emits: ["open-editor"],
		setup(__props, { emit: __emit }) {
			const emit = __emit;
			function handleMainClick() {
				const hostname = window.location.hostname;
				const cfg = getConfig(hostname);
				const newUrl = applyStrategy(window.location.href, cfg.modifyList, cfg.strategy, cfg.removeEmpty);
				if (newUrl !== window.location.href) window.location.href = newUrl;
				else if (window.GM_notification) try {
					window.GM_notification({
						text: "参数无变化，已跳过跳转",
						title: "RUP 提示",
						timeout: 2e3
					});
				} catch {}
			}
			function handleSubClick() {
				emit("open-editor");
			}
			return (_ctx, _cache) => {
				return (0, vue.openBlock)(), (0, vue.createElementBlock)("div", _hoisted_1$3, [(0, vue.createElementVNode)("div", _hoisted_2$3, [(0, vue.createElementVNode)("button", {
					class: "rup-fab__sub",
					type: "button",
					onClick: handleSubClick
				}, [(0, vue.createElementVNode)("span", {
					class: "rup-fab__icon",
					innerHTML: (0, vue.unref)(iconGear_default)
				}, null, 8, _hoisted_3$3)]), (0, vue.createElementVNode)("button", {
					class: "rup-fab__main",
					type: "button",
					onClick: handleMainClick
				}, [(0, vue.createElementVNode)("span", {
					class: "rup-fab__icon",
					innerHTML: (0, vue.unref)(iconFinger_default)
				}, null, 8, _hoisted_4$3)])])]);
			};
		}
	}, [["__scopeId", "data-v-3f5a5d6b"]]);
	var fabApp = null;
	var fabRootEl = null;
	function mountFab() {
		if (fabApp) unmountFab();
		const div = document.createElement("div");
		div.id = "rup-fab-root";
		document.body.appendChild(div);
		const app = (0, vue.createApp)({ render() {
			return (0, vue.h)(FabRequest_default, { onOpenEditor: () => {
				eventBus.emit("rup:open-editor");
			} });
		} });
		app.mount(div);
		fabApp = app;
		fabRootEl = div;
	}
	function unmountFab() {
		if (fabApp) fabApp.unmount();
		if (fabRootEl && fabRootEl.parentNode) fabRootEl.parentNode.removeChild(fabRootEl);
		fabApp = null;
		fabRootEl = null;
	}
	var _hoisted_1$2 = { class: "rup-panels" };
	var _hoisted_2$2 = { class: "rup-panel rup-panel--left" };
	var _hoisted_3$2 = ["data-flash-key", "onClick"];
	var _hoisted_4$2 = { class: "rup-key" };
	var _hoisted_5$2 = { class: "rup-val" };
	var _hoisted_6$2 = {
		key: 0,
		class: "rup-empty"
	};
	var _hoisted_7$2 = { class: "rup-panel rup-panel--right" };
	var _hoisted_8$2 = { class: "rup-list" };
	var _hoisted_9$2 = [
		"onUpdate:modelValue",
		"onInput",
		"onFocus",
		"onBlur"
	];
	var _hoisted_10$1 = [
		"onUpdate:modelValue",
		"onFocus",
		"onBlur"
	];
	var _hoisted_11 = ["onClick"];
	var _hoisted_12 = {
		key: 0,
		class: "rup-empty"
	};
	var ParamEditorPanels_default = _plugin_vue_export_helper_default({
		__name: "ParamEditorPanels",
		props: {
			modifyList: {
				type: Array,
				default: () => []
			},
			selectedKeys: {
				type: Set,
				default: () => new Set()
			}
		},
		emits: ["update:modifyList", "update:selectedKeys"],
		setup(__props, { expose: __expose, emit: __emit }) {
			const props = __props;
			const emit = __emit;
			const newKeyRefs = (0, vue.ref)({});
			const pendingFocusIdx = (0, vue.ref)(-1);
			const currentParamsSnapshot = (0, vue.ref)([]);
			const leftListRef = (0, vue.ref)(null);
			const leftRowRefs = (0, vue.ref)({});
			const focusedModifyKey = (0, vue.ref)("");
			const flashKey = (0, vue.ref)("");
			const flashSeq = (0, vue.ref)(0);
			let _flashTimer = null;
			let _blurClearTimer = null;
			const currentParams = (0, vue.computed)(() => currentParamsSnapshot.value);
			function setLeftRowRef(el, key) {
				if (!key) return;
				if (el) leftRowRefs.value[key] = el;
				else delete leftRowRefs.value[key];
			}
			function refreshCurrentParams() {
				currentParamsSnapshot.value = parseQuery(window.location.href);
				leftRowRefs.value = {};
			}
			refreshCurrentParams();
			function setKeyRef(el, idx) {
				if (el) {
					newKeyRefs.value[idx] = el;
					if (pendingFocusIdx.value === idx) (0, vue.nextTick)(() => {
						if (newKeyRefs.value[idx]) newKeyRefs.value[idx].focus();
						pendingFocusIdx.value = -1;
					});
				}
			}
			function handleModifyFocus(idx) {
				if (_blurClearTimer) {
					clearTimeout(_blurClearTimer);
					_blurClearTimer = null;
				}
				const item = props.modifyList[idx];
				if (!item) return;
				const k = (item.key || "").trim();
				if (!k) {
					focusedModifyKey.value = "";
					return;
				}
				if (!currentParamsSnapshot.value.some((p) => p.key === k)) {
					focusedModifyKey.value = "";
					return;
				}
				focusedModifyKey.value = k;
				scrollCurrentParamIntoView(k);
				triggerFlash(k);
			}
			function handleModifyBlur(idx) {
				if (_blurClearTimer) clearTimeout(_blurClearTimer);
				_blurClearTimer = setTimeout(() => {
					focusedModifyKey.value = "";
					_blurClearTimer = null;
				}, 60);
			}
			function scrollCurrentParamIntoView(key) {
				(0, vue.nextTick)(() => {
					const row = leftRowRefs.value[key];
					const container = leftListRef.value;
					if (!row || !container) return;
					try {
						const cTop = container.scrollTop;
						const cHeight = container.clientHeight;
						const rowOffsetTop = row.offsetTop;
						const rowHeight = row.offsetHeight;
						const targetTop = rowOffsetTop - Math.max(0, (cHeight - rowHeight) / 2);
						if ("scrollTo" in container && typeof container.scrollTo === "function") try {
							container.scrollTo({
								top: targetTop,
								behavior: "smooth"
							});
							return;
						} catch (e) {}
						const startTop = cTop;
						const delta = targetTop - startTop;
						let p = 0;
						const duration = 180;
						const startTs = Date.now();
						const step = () => {
							p = Math.min(1, (Date.now() - startTs) / duration);
							const ease = 1 - Math.pow(1 - p, 3);
							container.scrollTop = startTop + delta * ease;
							if (p < 1) requestAnimationFrame(step);
						};
						requestAnimationFrame(step);
					} catch (e) {}
				});
			}
			function triggerFlash(key) {
				if (!key) return;
				flashSeq.value += 1;
				flashKey.value = key;
				if (_flashTimer) clearTimeout(_flashTimer);
				_flashTimer = setTimeout(() => {
					flashKey.value = "";
					_flashTimer = null;
				}, 720);
			}
			function addToModifyList(item) {
				if (!props.modifyList.some((i) => i.key === item.key)) {
					const newList = [...props.modifyList, {
						key: item.key,
						value: item.value
					}];
					emit("update:modifyList", newList);
				}
				const newSet = new Set(props.selectedKeys);
				newSet.add(item.key);
				emit("update:selectedKeys", newSet);
			}
			function handleAddParam() {
				const newList = [...props.modifyList, {
					key: "",
					value: ""
				}];
				pendingFocusIdx.value = newList.length - 1;
				emit("update:modifyList", newList);
			}
			function handleKeyInput(idx) {
				const item = props.modifyList[idx];
				const newSet = new Set(props.selectedKeys);
				if (item && item.key) newSet.add(item.key);
				emit("update:selectedKeys", newSet);
				const k = item ? (item.key || "").trim() : "";
				if (focusedModifyKey.value || k) {
					const prev = focusedModifyKey.value;
					focusedModifyKey.value = k && currentParamsSnapshot.value.some((p) => p.key === k) ? k : "";
					if (k && focusedModifyKey.value && focusedModifyKey.value !== prev) {
						scrollCurrentParamIntoView(k);
						triggerFlash(k);
					}
				}
			}
			function handleDeleteParam(idx) {
				const item = props.modifyList[idx];
				const deletedKey = item ? item.key : "";
				const newList = props.modifyList.filter((_, i) => i !== idx);
				emit("update:modifyList", newList);
				if (deletedKey) {
					if (!newList.some((i) => i.key === deletedKey)) {
						const newSet = new Set(props.selectedKeys);
						newSet.delete(deletedKey);
						emit("update:selectedKeys", newSet);
						if (focusedModifyKey.value === deletedKey) focusedModifyKey.value = "";
					}
				}
			}
			(0, vue.watch)(() => props.visible, (val) => {
				if (val) refreshCurrentParams();
			});
			__expose({ refreshCurrentParams });
			return (_ctx, _cache) => {
				return (0, vue.openBlock)(), (0, vue.createElementBlock)("div", _hoisted_1$2, [(0, vue.createElementVNode)("div", _hoisted_2$2, [_cache[1] || (_cache[1] = (0, vue.createElementVNode)("h4", null, "当前参数", -1)), (0, vue.createElementVNode)("ul", {
					class: "rup-list rup-list--left",
					ref_key: "leftListRef",
					ref: leftListRef
				}, [((0, vue.openBlock)(true), (0, vue.createElementBlock)(vue.Fragment, null, (0, vue.renderList)(currentParams.value, (item, idx) => {
					return (0, vue.openBlock)(), (0, vue.createElementBlock)("li", {
						key: "cp-" + idx,
						ref_for: true,
						ref: (el) => setLeftRowRef(el, item.key),
						class: (0, vue.normalizeClass)({
							"rup-item--selected": __props.selectedKeys.has(item.key),
							"rup-item--focused": focusedModifyKey.value && item.key === focusedModifyKey.value,
							"rup-item--flash": item.key === flashKey.value
						}),
						"data-flash-key": flashKey.value && item.key === flashKey.value ? flashSeq.value : 0,
						onClick: ($event) => addToModifyList(item)
					}, [
						(0, vue.createElementVNode)("span", _hoisted_4$2, (0, vue.toDisplayString)(item.key), 1),
						_cache[0] || (_cache[0] = (0, vue.createElementVNode)("span", { class: "rup-eq" }, "=", -1)),
						(0, vue.createElementVNode)("span", _hoisted_5$2, (0, vue.toDisplayString)(item.value), 1)
					], 10, _hoisted_3$2);
				}), 128)), currentParams.value.length === 0 ? ((0, vue.openBlock)(), (0, vue.createElementBlock)("li", _hoisted_6$2, " 暂无 URL 查询参数 ")) : (0, vue.createCommentVNode)("", true)], 512)]), (0, vue.createElementVNode)("div", _hoisted_7$2, [(0, vue.createElementVNode)("h4", null, [_cache[2] || (_cache[2] = (0, vue.createTextVNode)(" 修改列表 ", -1)), (0, vue.createElementVNode)("span", {
					class: "rup-add-btn",
					onClick: handleAddParam
				}, "+ 新增参数")]), (0, vue.createElementVNode)("ul", _hoisted_8$2, [((0, vue.openBlock)(true), (0, vue.createElementBlock)(vue.Fragment, null, (0, vue.renderList)(__props.modifyList, (item, idx) => {
					return (0, vue.openBlock)(), (0, vue.createElementBlock)("li", {
						key: "mp-" + idx,
						class: "rup-modify-item"
					}, [
						(0, vue.withDirectives)((0, vue.createElementVNode)("input", {
							type: "text",
							class: "inp-key",
							ref_for: true,
							ref: (el) => setKeyRef(el, idx),
							"onUpdate:modelValue": ($event) => item.key = $event,
							onInput: ($event) => handleKeyInput(idx),
							onFocus: ($event) => handleModifyFocus(idx, "key"),
							onBlur: ($event) => handleModifyBlur(idx, "key"),
							placeholder: "参数名"
						}, null, 40, _hoisted_9$2), [[vue.vModelText, item.key]]),
						_cache[3] || (_cache[3] = (0, vue.createElementVNode)("span", { class: "rup-eq" }, "=", -1)),
						(0, vue.withDirectives)((0, vue.createElementVNode)("input", {
							type: "text",
							class: "inp-val",
							"onUpdate:modelValue": ($event) => item.value = $event,
							onFocus: ($event) => handleModifyFocus(idx, "value"),
							onBlur: ($event) => handleModifyBlur(idx, "value"),
							placeholder: "参数值"
						}, null, 40, _hoisted_10$1), [[vue.vModelText, item.value]]),
						(0, vue.createElementVNode)("button", {
							class: "btn-del",
							onClick: ($event) => handleDeleteParam(idx),
							title: "删除"
						}, " 🗑️ ", 8, _hoisted_11)
					]);
				}), 128)), __props.modifyList.length === 0 ? ((0, vue.openBlock)(), (0, vue.createElementBlock)("li", _hoisted_12, " 修改列表为空，点击左侧参数或「+ 新增参数」开始编辑 ")) : (0, vue.createCommentVNode)("", true)])])]);
			};
		}
	}, [["__scopeId", "data-v-854ea750"]]);
	var _hoisted_1$1 = {
		key: 0,
		class: "rup-editor"
	};
	var _hoisted_2$1 = { class: "rup-dialog" };
	var _hoisted_3$1 = { class: "rup-dialog__body" };
	var _hoisted_4$1 = { class: "rup-dialog__footer" };
	var _hoisted_5$1 = { class: "rup-footer__left" };
	var _hoisted_6$1 = { class: "rup-strategy-row" };
	var _hoisted_7$1 = { class: "rup-checkbox" };
	var _hoisted_8$1 = { class: "rup-strategy-row" };
	var _hoisted_9$1 = { class: "rup-radio-group" };
	var _hoisted_10 = ["value"];
	var ParamEditor_default = _plugin_vue_export_helper_default({
		__name: "ParamEditor",
		props: { visible: {
			type: Boolean,
			default: false
		} },
		emits: ["update:visible", "close"],
		setup(__props, { emit: __emit }) {
			const props = __props;
			const emit = __emit;
			const panelsRef = (0, vue.ref)(null);
			const localModifyList = (0, vue.ref)([]);
			const localSelectedKeys = (0, vue.ref)(new Set());
			const localStrategy = (0, vue.ref)("match_only");
			const localRemoveEmpty = (0, vue.ref)(false);
			let saveTimer = null;
			function triggerAutoSave() {
				if (saveTimer) clearTimeout(saveTimer);
				saveTimer = setTimeout(() => {
					const hostname = window.location.hostname;
					saveConfig(hostname, {
						modifyList: localModifyList.value,
						strategy: localStrategy.value,
						removeEmpty: localRemoveEmpty.value
					});
				}, 300);
			}
			(0, vue.watch)(() => localModifyList.value, () => {
				triggerAutoSave();
			}, { deep: true });
			(0, vue.watch)(() => props.visible, (val) => {
				if (val) {
					initConfig();
					if (panelsRef.value) panelsRef.value.refreshCurrentParams();
				}
			});
			(0, vue.onMounted)(() => {
				if (props.visible) initConfig();
			});
			function initConfig() {
				const hostname = window.location.hostname;
				const cfg = getConfig(hostname);
				localModifyList.value = JSON.parse(JSON.stringify(cfg.modifyList || []));
				localStrategy.value = cfg.strategy || "match_only";
				localRemoveEmpty.value = !!cfg.removeEmpty;
				localSelectedKeys.value = new Set();
				for (const item of localModifyList.value) if (item.key) localSelectedKeys.value.add(item.key);
			}
			function handleMaskClick() {
				emit("close");
				emit("update:visible", false);
			}
			function handleClose() {
				emit("close");
				emit("update:visible", false);
			}
			function applyChanges() {
				const hostname = window.location.hostname;
				const cfg = {
					modifyList: localModifyList.value.filter((i) => i.key !== ""),
					strategy: localStrategy.value,
					removeEmpty: localRemoveEmpty.value,
					lastUrl: window.location.href
				};
				saveConfig(hostname, cfg);
				const newUrl = applyStrategy(window.location.href, cfg.modifyList, cfg.strategy, cfg.removeEmpty);
				emit("close");
				emit("update:visible", false);
				if (newUrl !== window.location.href) window.location.href = newUrl;
			}
			return (_ctx, _cache) => {
				return (0, vue.openBlock)(), (0, vue.createBlock)(vue.Teleport, { to: "body" }, [__props.visible ? ((0, vue.openBlock)(), (0, vue.createElementBlock)("div", _hoisted_1$1, [(0, vue.createElementVNode)("div", {
					class: "rup-mask",
					onClick: handleMaskClick
				}), (0, vue.createElementVNode)("div", _hoisted_2$1, [
					(0, vue.createElementVNode)("div", { class: "rup-dialog__header" }, [_cache[4] || (_cache[4] = (0, vue.createElementVNode)("h3", null, "RUP - 参数编辑", -1)), (0, vue.createElementVNode)("span", {
						class: "rup-close",
						onClick: handleClose
					}, "✕")]),
					(0, vue.createElementVNode)("div", _hoisted_3$1, [(0, vue.createVNode)(ParamEditorPanels_default, {
						ref_key: "panelsRef",
						ref: panelsRef,
						modifyList: localModifyList.value,
						"onUpdate:modifyList": _cache[0] || (_cache[0] = ($event) => localModifyList.value = $event),
						selectedKeys: localSelectedKeys.value,
						"onUpdate:selectedKeys": _cache[1] || (_cache[1] = ($event) => localSelectedKeys.value = $event)
					}, null, 8, ["modifyList", "selectedKeys"])]),
					(0, vue.createElementVNode)("div", _hoisted_4$1, [(0, vue.createElementVNode)("div", _hoisted_5$1, [(0, vue.createElementVNode)("div", _hoisted_6$1, [(0, vue.createElementVNode)("label", _hoisted_7$1, [(0, vue.withDirectives)((0, vue.createElementVNode)("input", {
						type: "checkbox",
						"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => localRemoveEmpty.value = $event),
						onChange: triggerAutoSave
					}, null, 544), [[vue.vModelCheckbox, localRemoveEmpty.value]]), _cache[5] || (_cache[5] = (0, vue.createElementVNode)("span", null, "删除空值", -1))]), _cache[6] || (_cache[6] = (0, vue.createElementVNode)("span", { class: "rup-tip" }, "勾选后 modifyList 中 value 为空的参数将被删除", -1))]), (0, vue.createElementVNode)("div", _hoisted_8$1, [_cache[7] || (_cache[7] = (0, vue.createElementVNode)("label", { class: "rup-strategy-label" }, "修改策略", -1)), (0, vue.createElementVNode)("div", _hoisted_9$1, [((0, vue.openBlock)(true), (0, vue.createElementBlock)(vue.Fragment, null, (0, vue.renderList)((0, vue.unref)(STRATEGY_LABELS), (label, key) => {
						return (0, vue.openBlock)(), (0, vue.createElementBlock)("label", {
							key,
							class: "rup-radio"
						}, [(0, vue.withDirectives)((0, vue.createElementVNode)("input", {
							type: "radio",
							value: key,
							"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => localStrategy.value = $event),
							onChange: triggerAutoSave
						}, null, 40, _hoisted_10), [[vue.vModelRadio, localStrategy.value]]), (0, vue.createElementVNode)("span", null, (0, vue.toDisplayString)(label), 1)]);
					}), 128))])])]), (0, vue.createElementVNode)("div", { class: "rup-footer__right" }, [(0, vue.createElementVNode)("button", {
						class: "rup-btn rup-btn--secondary",
						onClick: handleClose
					}, " 取消 "), (0, vue.createElementVNode)("button", {
						class: "rup-btn rup-btn--primary",
						onClick: applyChanges
					}, " 应用修改 ")])])
				])])) : (0, vue.createCommentVNode)("", true)]);
			};
		}
	}, [["__scopeId", "data-v-1dda74c6"]]);
	var editorApp = null;
	var editorRootEl = null;
	var eventSubscribed$1 = false;
	function subscribeEvent$1() {
		if (eventSubscribed$1) return;
		eventSubscribed$1 = true;
		eventBus.on("rup:open-editor", mountEditor);
	}
	function mountEditor() {
		subscribeEvent$1();
		if (editorApp) unmountEditor();
		const div = document.createElement("div");
		div.id = "rup-editor-root";
		document.body.appendChild(div);
		const visibleRef = (0, vue.ref)(true);
		const app = (0, vue.createApp)({ setup() {
			return () => {
				return (0, vue.h)(ParamEditor_default, {
					visible: visibleRef.value,
					"onUpdate:visible": (val) => {
						visibleRef.value = val;
					},
					onClose: () => {
						visibleRef.value = false;
						setTimeout(() => {
							unmountEditor();
						}, 0);
					}
				});
			};
		} });
		app.mount(div);
		editorApp = app;
		editorRootEl = div;
	}
	function unmountEditor() {
		if (editorApp) try {
			editorApp.unmount();
		} catch (e) {}
		if (editorRootEl && editorRootEl.parentNode) editorRootEl.parentNode.removeChild(editorRootEl);
		editorApp = null;
		editorRootEl = null;
	}
	var _hoisted_1 = {
		key: 0,
		class: "rup-editor"
	};
	var _hoisted_2 = { class: "rup-dialog" };
	var _hoisted_3 = { class: "rup-dialog__body" };
	var _hoisted_4 = { class: "rup-export-section" };
	var _hoisted_5 = { class: "rup-details" };
	var _hoisted_6 = ["value"];
	var _hoisted_7 = { class: "rup-import-section" };
	var _hoisted_8 = {
		key: 0,
		class: "rup-alert rup-alert--error"
	};
	var _hoisted_9 = {
		key: 1,
		class: "rup-alert rup-alert--success"
	};
	var BackupRestore_default = _plugin_vue_export_helper_default({
		__name: "BackupRestore",
		props: { visible: {
			type: Boolean,
			default: false
		} },
		emits: ["update:visible", "close"],
		setup(__props, { emit: __emit }) {
			const emit = __emit;
			const fileInput = (0, vue.ref)(null);
			const errorMsg = (0, vue.ref)("");
			const successMsg = (0, vue.ref)("");
			const isDragOver = (0, vue.ref)(false);
			const configJsonPreview = (0, vue.computed)(() => {
				return JSON.stringify(getFullConfig(), null, 2);
			});
			function handleMaskClick() {
				emit("close");
				emit("update:visible", false);
			}
			function handleClose() {
				emit("close");
				emit("update:visible", false);
			}
			function padZero(num) {
				return num.toString().padStart(2, "0");
			}
			function handleExport() {
				const fullConfig = getFullConfig();
				const now = new Date();
				const filename = `rup-config-${now.getFullYear()}${padZero(now.getMonth() + 1)}${padZero(now.getDate())}-${padZero(now.getHours())}${padZero(now.getMinutes())}${padZero(now.getSeconds())}.json`;
				const blob = new Blob([JSON.stringify(fullConfig, null, 2)], { type: "application/json" });
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = filename;
				a.click();
				setTimeout(() => {
					URL.revokeObjectURL(url);
				}, 500);
			}
			function triggerFileSelect() {
				if (fileInput.value) fileInput.value.click();
			}
			function handleFileChange(e) {
				handleFile(e.target.files && e.target.files[0]);
				if (fileInput.value) fileInput.value.value = "";
			}
			function handleDragOver() {
				isDragOver.value = true;
			}
			function handleDragLeave() {
				isDragOver.value = false;
			}
			function handleDrop(e) {
				isDragOver.value = false;
				handleFile(e.dataTransfer.files && e.dataTransfer.files[0]);
			}
			function handleFile(file) {
				errorMsg.value = "";
				successMsg.value = "";
				if (!file) return;
				const reader = new FileReader();
				reader.onload = (e) => {
					const jsonStr = e.target.result;
					try {
						const obj = JSON.parse(jsonStr);
						if (typeof obj !== "object" || obj === null || !Array.isArray(obj.enabledDomains) || typeof obj.domainConfigs !== "object" || obj.domainConfigs === null) {
							errorMsg.value = "❌ 文件格式错误：缺少 enabledDomains 数组或 domainConfigs 对象";
							return;
						}
						if (window.confirm("导入后将覆盖当前所有配置，是否继续？")) {
							setFullConfig(obj);
							successMsg.value = "✅ 导入成功！即将关闭弹窗…";
							eventBus.emit("rup:config-imported", obj);
							setTimeout(() => {
								emit("close");
								emit("update:visible", false);
							}, 1500);
						}
					} catch (err) {
						errorMsg.value = "❌ 文件格式错误：缺少 enabledDomains 数组或 domainConfigs 对象";
					}
				};
				reader.readAsText(file);
			}
			return (_ctx, _cache) => {
				return (0, vue.openBlock)(), (0, vue.createBlock)(vue.Teleport, { to: "body" }, [__props.visible ? ((0, vue.openBlock)(), (0, vue.createElementBlock)("div", _hoisted_1, [(0, vue.createElementVNode)("div", {
					class: "rup-mask",
					onClick: handleMaskClick
				}), (0, vue.createElementVNode)("div", _hoisted_2, [
					(0, vue.createElementVNode)("div", { class: "rup-dialog__header" }, [_cache[0] || (_cache[0] = (0, vue.createElementVNode)("h3", null, "RUP 备份与恢复", -1)), (0, vue.createElementVNode)("span", {
						class: "rup-close",
						onClick: handleClose
					}, "✕")]),
					(0, vue.createElementVNode)("div", _hoisted_3, [(0, vue.createElementVNode)("div", _hoisted_4, [
						_cache[2] || (_cache[2] = (0, vue.createElementVNode)("h4", { class: "rup-section-title" }, "导出配置", -1)),
						(0, vue.createElementVNode)("details", _hoisted_5, [_cache[1] || (_cache[1] = (0, vue.createElementVNode)("summary", { class: "rup-summary" }, "预览 JSON 配置", -1)), (0, vue.createElementVNode)("textarea", {
							class: "rup-textarea",
							value: configJsonPreview.value,
							readonly: ""
						}, null, 8, _hoisted_6)]),
						(0, vue.createElementVNode)("button", {
							class: "rup-btn rup-btn--export",
							onClick: handleExport
						}, " 📥 导出 .json 文件 ")
					]), (0, vue.createElementVNode)("div", _hoisted_7, [
						_cache[5] || (_cache[5] = (0, vue.createElementVNode)("h4", { class: "rup-section-title" }, "导入配置", -1)),
						errorMsg.value ? ((0, vue.openBlock)(), (0, vue.createElementBlock)("div", _hoisted_8, (0, vue.toDisplayString)(errorMsg.value), 1)) : (0, vue.createCommentVNode)("", true),
						successMsg.value ? ((0, vue.openBlock)(), (0, vue.createElementBlock)("div", _hoisted_9, (0, vue.toDisplayString)(successMsg.value), 1)) : (0, vue.createCommentVNode)("", true),
						(0, vue.createElementVNode)("div", {
							class: (0, vue.normalizeClass)(["rup-dropzone", { "rup-dropzone--hover": isDragOver.value }]),
							onClick: triggerFileSelect,
							onDragover: (0, vue.withModifiers)(handleDragOver, ["prevent"]),
							onDragleave: (0, vue.withModifiers)(handleDragLeave, ["prevent"]),
							onDrop: (0, vue.withModifiers)(handleDrop, ["prevent"])
						}, [
							_cache[3] || (_cache[3] = (0, vue.createElementVNode)("div", { class: "rup-dropzone__text1" }, "📁 点击选择 JSON 文件", -1)),
							_cache[4] || (_cache[4] = (0, vue.createElementVNode)("div", { class: "rup-dropzone__text2" }, "或拖拽文件到此区域", -1)),
							(0, vue.createElementVNode)("input", {
								ref_key: "fileInput",
								ref: fileInput,
								type: "file",
								accept: ".json,application/json",
								onChange: handleFileChange,
								style: { "display": "none" }
							}, null, 544)
						], 34)
					])]),
					(0, vue.createElementVNode)("div", { class: "rup-dialog__footer" }, [_cache[6] || (_cache[6] = (0, vue.createElementVNode)("div", { class: "rup-footer__left" }, null, -1)), (0, vue.createElementVNode)("div", { class: "rup-footer__right" }, [(0, vue.createElementVNode)("button", {
						class: "rup-btn rup-btn--secondary",
						onClick: handleClose
					}, " 关闭 ")])])
				])])) : (0, vue.createCommentVNode)("", true)]);
			};
		}
	}, [["__scopeId", "data-v-9ee4b870"]]);
	var backupApp = null;
	var backupRootEl = null;
	var eventSubscribed = false;
	function subscribeEvent() {
		if (eventSubscribed) return;
		eventSubscribed = true;
		eventBus.on("rup:open-backup", mountBackup);
	}
	function mountBackup() {
		subscribeEvent();
		if (backupApp) unmountBackup();
		const div = document.createElement("div");
		div.id = "rup-backup-root";
		document.body.appendChild(div);
		const visibleRef = (0, vue.ref)(true);
		const app = (0, vue.createApp)({ setup() {
			return () => {
				return (0, vue.h)(BackupRestore_default, {
					visible: visibleRef.value,
					"onUpdate:visible": (val) => {
						visibleRef.value = val;
					},
					onClose: () => {
						visibleRef.value = false;
						setTimeout(() => {
							unmountBackup();
						}, 0);
					}
				});
			};
		} });
		app.mount(div);
		backupApp = app;
		backupRootEl = div;
	}
	function unmountBackup() {
		if (backupApp) try {
			backupApp.unmount();
		} catch (e) {}
		if (backupRootEl && backupRootEl.parentNode) backupRootEl.parentNode.removeChild(backupRootEl);
		backupApp = null;
		backupRootEl = null;
	}
	(function topFrameGuard() {
		try {
			if (typeof window === "undefined") return;
			if (!(function() {
				try {
					return window.top === window.self || window.top === window || window.parent === window.self;
				} catch (e) {
					return false;
				}
			})()) return;
		} catch (e) {
			return;
		}
	})();
	(function initStorage() {
		const cfg = getFullConfig();
		if (!cfg.enabledDomains || !cfg.domainConfigs) setFullConfig({
			enabledDomains: [],
			domainConfigs: {}
		});
	})();
	var currentHostname = (function getHostnameSafe() {
		try {
			return window.location.hostname || "unknown";
		} catch {
			return "unknown";
		}
	})();
	registerMenus(currentHostname);
	if (isDomainEnabled(currentHostname)) try {
		mountFab();
	} catch (e) {}
	eventBus.on("rup:domain-toggle", ({ hostname, enabled }) => {
		if (hostname !== currentHostname) return;
		try {
			if (enabled) mountFab();
			else {
				unmountFab();
				unmountEditor();
			}
		} catch (e) {}
	});
	eventBus.on("rup:open-editor", () => {
		if (isDomainEnabled(currentHostname)) try {
			mountEditor();
		} catch {}
	});
	eventBus.on("rup:open-backup", () => {
		try {
			mountBackup();
		} catch {}
	});
	eventBus.on("rup:config-imported", () => {
		try {
			unmountFab();
			if (isDomainEnabled(currentHostname)) mountFab();
			refreshMenus();
		} catch {}
	});
})(Vue);
