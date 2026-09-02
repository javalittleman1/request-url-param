const STORAGE_KEY = 'rup_full_config';

function getDefaultFullConfig() {
  return {
    enabledDomains: [],
    domainConfigs: {},
  };
}

function getDefaultDomainConfig() {
  return {
    modifyList: [],
    strategy: 'match_only',
    removeEmpty: false,
  };
}

function hasGM() {
  return typeof GM_setValue === 'function'
    && typeof GM_getValue === 'function'
    && typeof GM_deleteValue === 'function';
}

function storageGet(key, defaultValue) {
  if (hasGM()) {
    return GM_getValue(key, defaultValue);
  }
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function storageSet(key, value) {
  if (hasGM()) {
    GM_setValue(key, value);
  } else {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
    }
  }
}

function storageDelete(key) {
  if (hasGM()) {
    GM_deleteValue(key);
  } else {
    try {
      localStorage.removeItem(key);
    } catch {
    }
  }
}

export function getFullConfig() {
  const cfg = storageGet(STORAGE_KEY, null);
  if (!cfg || typeof cfg !== 'object') {
    return getDefaultFullConfig();
  }
  if (!Array.isArray(cfg.enabledDomains)) {
    cfg.enabledDomains = [];
  }
  if (!cfg.domainConfigs || typeof cfg.domainConfigs !== 'object') {
    cfg.domainConfigs = {};
  }
  return cfg;
}

export function setFullConfig(cfg) {
  if (!cfg || typeof cfg !== 'object') {
    cfg = getDefaultFullConfig();
  }
  storageSet(STORAGE_KEY, cfg);
}

export function getConfig(hostname) {
  const full = getFullConfig();
  const cfg = full.domainConfigs[hostname];
  if (!cfg || typeof cfg !== 'object') {
    return getDefaultDomainConfig();
  }
  const result = {
    modifyList: Array.isArray(cfg.modifyList) ? cfg.modifyList : [],
    strategy: ['match_only', 'list_only', 'match_and_diff'].includes(cfg.strategy)
      ? cfg.strategy
      : 'match_only',
    removeEmpty: !!cfg.removeEmpty,
  };
  if (cfg.lastUrl !== undefined) {
    result.lastUrl = cfg.lastUrl;
  }
  return result;
}

export function saveConfig(hostname, cfg) {
  const full = getFullConfig();
  full.domainConfigs[hostname] = {
    modifyList: Array.isArray(cfg.modifyList) ? cfg.modifyList : [],
    strategy: ['match_only', 'list_only', 'match_and_diff'].includes(cfg.strategy)
      ? cfg.strategy
      : 'match_only',
    removeEmpty: !!cfg.removeEmpty,
  };
  if (cfg.lastUrl !== undefined) {
    full.domainConfigs[hostname].lastUrl = cfg.lastUrl;
  }
  setFullConfig(full);
}

export function setDomainEnabled(hostname, enabled) {
  const full = getFullConfig();
  const idx = full.enabledDomains.indexOf(hostname);
  if (enabled && idx === -1) {
    full.enabledDomains.push(hostname);
  } else if (!enabled && idx !== -1) {
    full.enabledDomains.splice(idx, 1);
  }
  setFullConfig(full);
}

export function isDomainEnabled(hostname) {
  const full = getFullConfig();
  return full.enabledDomains.includes(hostname);
}
