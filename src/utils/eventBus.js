const eventMap = new Map();

function on(event, handler) {
  if (!eventMap.has(event)) {
    eventMap.set(event, new Set());
  }
  eventMap.get(event).add(handler);
}

function off(event, handler) {
  const handlers = eventMap.get(event);
  if (!handlers) return;
  if (handler) {
    handlers.delete(handler);
  } else {
    handlers.clear();
  }
}

function emit(event, ...args) {
  const handlers = eventMap.get(event);
  if (!handlers) return;
  for (const handler of handlers) {
    try {
      handler(...args);
    } catch (e) {
      console.error(e);
    }
  }
}

export const eventBus = { on, off, emit };
