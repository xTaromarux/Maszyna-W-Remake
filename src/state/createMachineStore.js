import { initialMachineState } from './initialMachineState.js';
import { machineMethods } from './machineMethods.js';
import { machineSelectors } from './machineSelectors.js';
import { translate } from '../i18n/index.js';

export const persistedSettings = [
  'addresBits',
  'codeBits',
  'oddDelay',
  'stepDelay',
  'numberFormat',
  'extras',
  'lightMode',
  'language',
  'registerFormats',
  'autocompleteEnabled',
  'autoResetOnAsmCompile',
  'decSigned',
];
const formats = ['dec', 'hex', 'bin'];

/** React subscribes to a revision; timed micro-operations share one live machine.
 * Only plain data and sets are observed. Native sockets, dates and timers retain
 * their identity. Preferences are persisted once per batch, independently of logs. */
export function createMachineStore() {
  let version = 0,
    scheduled = false,
    active = false,
    initialized = false,
    restoring = false;
  let settingsDirty = false;
  const listeners = new Set(),
    proxies = new WeakMap(),
    rawValues = new WeakMap();
  const target = {};
  let machine;
  const publish = () => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      if (!active) return;
      if (settingsDirty && !restoring) {
        settingsDirty = false;
        machine.saveToLS();
      }
      version++;
      listeners.forEach((listener) => listener());
    });
  };
  function changed(root, path, value, oldValue) {
    if (!active) return;
    if (persistedSettings.includes(root)) settingsDirty = true;
    if (!restoring) {
      if (root === 'addresBits') machine.resizeMemory();
      if (root === 'lightMode') applyTheme();
      if (root === 'language') machine.syncDocumentLanguage();
      if (root === 'numberFormat' && formats.includes(value))
        machine.registerFormats = Object.fromEntries(Object.keys(machine.registerFormats).map((key) => [key, value]));
    }
    if ((root === 'settingsOpen' || root === 'commandListOpen') && machine.globalBackdropOpen) {
      clearTimeout(machine.blurHideTimer);
      machine.disappearBlour = true;
    }
    if (!machine.suppressBroadcast && !restoring) {
      const fields = { ACC: 'acc', A: 'a', S: 's', programCounter: 'c', I: 'i' };
      if (fields[root]) machine.sendPartialData(fields[root], value);
      if (root === 'signals') {
        if (path.length === 1) machine.sendPartialData(path[0], value);
        else
          Object.keys(machine.signals).forEach((key) => {
            if (machine.signals[key] !== oldValue?.[key]) machine.sendPartialData(key, machine.signals[key]);
          });
      }
      if (root === 'mem' && (!path.length || Number(path[0]) < 4)) machine.sendMemUpdate();
    }
    publish();
  }
  function observable(value, root, path = []) {
    if (!value || typeof value !== 'object') return value;
    if (rawValues.has(value)) return value;
    const plain = Object.getPrototypeOf(value) === Object.prototype || Array.isArray(value);
    if (!plain && !(value instanceof Set)) return value;
    let byPath = proxies.get(value);
    if (!byPath) proxies.set(value, (byPath = new Map()));
    const key = `${root}:${path.join('.')}`;
    if (byPath.has(key)) return byPath.get(key);
    const proxy = new Proxy(value, {
      get(object, key) {
        if (object instanceof Set) {
          if (['add', 'delete', 'clear'].includes(key))
            return (...args) => {
              const size = object.size,
                had = object.has(args[0]);
              const result = object[key](...args);
              if (size !== object.size || (key === 'add' && !had)) changed(root, path, object);
              return key === 'add' ? proxy : result;
            };
          const member = Reflect.get(object, key, object);
          return typeof member === 'function' ? member.bind(object) : member;
        }
        return observable(Reflect.get(object, key), root, [...path, String(key)]);
      },
      set(object, key, next) {
        const old = object[key],
          raw = rawValues.get(next) || next;
        if (Object.is(old, raw)) return true;
        object[key] = raw;
        changed(root, [...path, String(key)], raw, old);
        return true;
      },
      deleteProperty(object, key) {
        delete object[key];
        changed(root, [...path, String(key)]);
        return true;
      },
    });
    rawValues.set(proxy, value);
    byPath.set(key, proxy);
    return proxy;
  }
  machine = new Proxy(target, {
    get(object, key) {
      return observable(Reflect.get(object, key, machine), String(key));
    },
    set(object, key, value) {
      if (key === 'addresBits' || key === 'codeBits') {
        const other = key === 'addresBits' ? 'codeBits' : 'addresBits';
        if (!Number.isFinite(Number(value))) return true;
        value = Math.max(1, Math.min(16, 30 - (object[other] || 1), Math.trunc(Number(value))));
      }
      const old = object[key],
        raw = rawValues.get(value) || value;
      if (Object.is(old, raw)) return true;
      object[key] = raw;
      changed(String(key), [], raw, old);
      return true;
    },
  });
  for (const [name, method] of Object.entries(machineMethods)) target[name] = method.bind(machine);
  target.t = translate;
  Object.assign(target, initialMachineState.call(machine));
  for (const [name, selector] of Object.entries(machineSelectors))
    Object.defineProperty(target, name, { get: () => selector.call(machine) });
  const applyTheme = () => {
    document.body.classList.toggle('lightMode', machine.lightMode);
    document.body.classList.toggle('darkMode', !machine.lightMode);
  };
  target.saveToLS = () => {
    try {
      localStorage.setItem('W', JSON.stringify(Object.fromEntries(persistedSettings.map((key) => [key, machine[key]]))));
    } catch {
      /* Storage may be unavailable or full; simulation remains usable. */
    }
  };
  target.loadFromLS = () => {
    restoring = true;
    try {
      const saved = JSON.parse(localStorage.getItem('W') || '{}');
      if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return;
      for (const key of persistedSettings) {
        const value = saved[key];
        if (value === undefined) continue;
        if (key === 'extras' && value && typeof value === 'object') {
          const defaults = machine.getDefaultExtras();
          for (const [name, entry] of Object.entries(defaults)) {
            if (typeof entry === 'boolean') defaults[name] = typeof value[name] === 'boolean' ? value[name] : entry;
            else for (const sub of Object.keys(entry)) if (typeof value[name]?.[sub] === 'boolean') defaults[name][sub] = value[name][sub];
          }
          machine.extras = defaults;
        } else if (key === 'registerFormats' && value && typeof value === 'object') {
          for (const field of Object.keys(machine.registerFormats))
            if (formats.includes(value[field])) machine.registerFormats[field] = value[field];
        } else if (key === 'numberFormat' && formats.includes(value)) machine[key] = value;
        else if (key === 'language' && ['pl', 'en'].includes(value)) machine[key] = value;
        else if (typeof machine[key] === 'boolean' && typeof value === 'boolean') machine[key] = value;
        else if (typeof machine[key] === 'number' && Number.isFinite(value))
          machine[key] = Math.max(key === 'stepDelay' ? 5 : 0, Math.min(10000, value));
      }
    } catch {
      /* Ignore malformed legacy preferences. */
    } finally {
      restoring = false;
    }
  };
  const onResize = () => {
    machine.isMobile = window.innerWidth <= 768;
  };
  return {
    machine,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => version,
    start() {
      active = true;
      if (!initialized) {
        machine.loadFromLS();
        machine.resizeMemory();
        machine.addLog(machine.t('logs.systemInitialized'), 'system');
        initialized = true;
      }
      applyTheme();
      machine.syncDocumentLanguage();
      onResize();
      if (machine.platform === 'esp') machine.initWebsocket();
      window.addEventListener('keydown', machine.handleKeyPress);
      window.addEventListener('resize', onResize);
      window.addEventListener('pagehide', machine.saveToLS);
      publish();
    },
    dispose() {
      machine.saveToLS();
      active = false;
      machine._stopRun();
      machine.uncompileCode();
      for (const key of ['wsPingTimer', 'toastTimer', 'blurHideTimer', 'errorTimeoutId', 'reconnectTimer', 'autoStepInterval']) {
        clearTimeout(machine[key]);
        clearInterval(machine[key]);
      }
      machine.ws?.close();
      machine.ws = null;
      window.removeEventListener('keydown', machine.handleKeyPress);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pagehide', machine.saveToLS);
    },
  };
}
