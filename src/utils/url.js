export function parseQuery(url) {
  const result = [];
  if (!url) return result;

  let searchPart = '';
  const hashIdx = url.indexOf('#');
  const withoutHash = hashIdx !== -1 ? url.slice(0, hashIdx) : url;

  const qIdx = withoutHash.indexOf('?');
  if (qIdx !== -1) {
    searchPart = withoutHash.slice(qIdx + 1);
  } else if (withoutHash.includes('=') || withoutHash.includes('&')) {
    searchPart = withoutHash;
  }

  if (!searchPart) return result;

  const pairs = searchPart.split('&');
  for (const pair of pairs) {
    if (!pair) continue;
    const eqIdx = pair.indexOf('=');
    let key, value;
    if (eqIdx !== -1) {
      key = pair.slice(0, eqIdx);
      value = pair.slice(eqIdx + 1);
    } else {
      key = pair;
      value = '';
    }
    result.push({
      key: decodeURIComponent(key.replace(/\+/g, ' ')),
      value: decodeURIComponent(value.replace(/\+/g, ' ')),
    });
  }
  return result;
}

export function buildQuery(params) {
  if (!Array.isArray(params) || params.length === 0) return '';

  const parts = [];
  for (const item of params) {
    if (!item || typeof item.key === 'undefined') continue;
    const key = encodeURIComponent(String(item.key)).replace(/%20/g, '+');
    const value = item.value === null || item.value === undefined
      ? ''
      : encodeURIComponent(String(item.value)).replace(/%20/g, '+');
    parts.push(`${key}=${value}`);
  }
  return parts.join('&');
}

export function applyStrategy(rawUrl, modifyList, strategy, removeEmpty) {
  if (!rawUrl) return rawUrl;

  let hashPart = '';
  const hashIdx = rawUrl.indexOf('#');
  let urlWithoutHash = rawUrl;
  if (hashIdx !== -1) {
    hashPart = rawUrl.slice(hashIdx);
    urlWithoutHash = rawUrl.slice(0, hashIdx);
  }

  let basePart = '';
  let searchPart = '';
  const qIdx = urlWithoutHash.indexOf('?');
  if (qIdx !== -1) {
    basePart = urlWithoutHash.slice(0, qIdx);
    searchPart = urlWithoutHash.slice(qIdx + 1);
  } else {
    basePart = urlWithoutHash;
  }

  const originalParams = parseQuery(searchPart);
  const safeModifyList = Array.isArray(modifyList) ? modifyList : [];
  const safeRemoveEmpty = !!removeEmpty;

  let finalParams = [];

  switch (strategy) {
    case 'list_only': {
      for (const item of safeModifyList) {
        if (safeRemoveEmpty && (item.value === '' || item.value === null || item.value === undefined)) {
          continue;
        }
        finalParams.push({ key: item.key, value: item.value });
      }
      break;
    }

    case 'match_only': {
      const modifyMap = new Map();
      for (const item of safeModifyList) {
        if (!modifyMap.has(item.key)) {
          modifyMap.set(item.key, []);
        }
        modifyMap.get(item.key).push(item);
      }

      for (const original of originalParams) {
        const key = original.key;
        if (modifyMap.has(key)) {
          const modifiers = modifyMap.get(key);
          if (modifiers.length > 0) {
            const mod = modifiers.shift();
            if (!safeRemoveEmpty || (mod.value !== '' && mod.value !== null && mod.value !== undefined)) {
              finalParams.push({ key, value: mod.value });
            }
          } else {
            finalParams.push(original);
          }
        } else {
          finalParams.push(original);
        }
      }
      break;
    }

    case 'match_and_diff': {
      const modifyMap = new Map();
      for (const item of safeModifyList) {
        if (!modifyMap.has(item.key)) {
          modifyMap.set(item.key, []);
        }
        modifyMap.get(item.key).push(item);
      }

      for (const original of originalParams) {
        const key = original.key;
        if (modifyMap.has(key) && modifyMap.get(key).length > 0) {
          const modifiers = modifyMap.get(key);
          const mod = modifiers.shift();
          if (!safeRemoveEmpty || (mod.value !== '' && mod.value !== null && mod.value !== undefined)) {
            finalParams.push({ key, value: mod.value });
          }
        } else {
          finalParams.push(original);
        }
      }

      for (const [key, modifiers] of modifyMap.entries()) {
        for (const mod of modifiers) {
          if (!safeRemoveEmpty || (mod.value !== '' && mod.value !== null && mod.value !== undefined)) {
            finalParams.push({ key, value: mod.value });
          }
        }
      }
      break;
    }

    default: {
      finalParams = originalParams.slice();
      break;
    }
  }

  const newQuery = buildQuery(finalParams);
  let result = basePart;
  if (newQuery) {
    result += '?' + newQuery;
  }
  result += hashPart;
  return result;
}
