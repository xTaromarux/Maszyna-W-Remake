import type { Action, NumberFormat } from '@/Types/Common';
import type { Machine, MachineStore, RegisterFormats } from '@/Types/Simulator';
import { translate } from '../I18n/Index';
import { clamp } from '../Shared/Utils/Numbers';
import { getStorageItem, setStorageItem } from '../Shared/Utils/Storage';
import { initialMachineState } from './InitialMachineState';
import { machineMethods } from './MachineMethods';
import { createMicroInstructionActions } from './MicroInstructions/MicroInstructionActions';
import { machineSelectors } from './MachineSelectors';

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
] as const;
const formats = ['dec', 'hex', 'bin'];

/** React subscribes to a revision; timed micro-operations share one live machine.
 * Only plain data and sets are observed. Native sockets, dates and timers retain
 * their identity. Preferences are persisted once per batch, independently of logs. */
export function createMachineStore(): MachineStore {
  let version = 0,
    scheduled = false,
    active = false,
    initialized = false,
    restoring = false;
  let settingsDirty = false;
  const listeners = new Set<Action>(),
    proxies = new WeakMap<object, Map<string, object>>(),
    rawValues = new WeakMap<object, object>();
  // Populated synchronously below before the store is exposed.
  const target = {} as Machine;
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
  function changed(root: string, path: string[], value?: unknown, oldValue?: unknown) {
    if (!active) return;
    if (persistedSettings.some((key) => key === root)) settingsDirty = true;
    if (!restoring) {
      if (root === 'addresBits') machine.resizeMemory();
      if (root === 'lightMode') applyTheme();
      if (root === 'language') machine.syncDocumentLanguage();
      if (root === 'numberFormat' && formats.includes(value as NumberFormat))
        machine.registerFormats = Object.fromEntries(
          Object.keys(machine.registerFormats).map((key) => [key, value as NumberFormat])
        ) as RegisterFormats;
    }
    if ((root === 'settingsOpen' || root === 'commandListOpen') && machine.globalBackdropOpen) {
      clearTimeout(machine.blurHideTimer ?? undefined);
      machine.disappearBlour = true;
    }
    if (!machine.suppressBroadcast && !restoring) {
      const fields: Record<string, string> = { ACC: 'acc', A: 'a', S: 's', programCounter: 'c', I: 'i' };
      if (fields[root] && (typeof value === 'number' || typeof value === 'boolean')) machine.sendPartialData(fields[root], value);
      if (root === 'signals') {
        if (path.length === 1 && typeof value === 'boolean') machine.sendPartialData(path[0], value);
        else
          Object.keys(machine.signals).forEach((key) => {
            if (machine.signals[key] !== (oldValue && typeof oldValue === 'object' ? Reflect.get(oldValue, key) : undefined))
              machine.sendPartialData(key, machine.signals[key]);
          });
      }
      if (root === 'mem' && (!path.length || Number(path[0]) < 4)) machine.sendMemUpdate();
    }
    publish();
  }
  function observable(value: unknown, root: string, path: string[] = []): unknown {
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
          if (key === 'add' || key === 'delete' || key === 'clear')
            return (...args: unknown[]) => {
              const size = object.size,
                had = object.has(args[0]);
              const result: unknown = Reflect.apply(Reflect.get(object, key), object, args);
              if (size !== object.size || (key === 'add' && !had)) changed(root, path, object);
              return key === 'add' ? proxy : result;
            };
          const member = Reflect.get(object, key, object);
          return typeof member === 'function' ? member.bind(object) : member;
        }
        return observable(Reflect.get(object, key), root, [...path, String(key)]);
      },
      set(object, key, next) {
        const old: unknown = Reflect.get(object, key),
          raw = (next && typeof next === 'object' ? rawValues.get(next) : undefined) || next;
        if (Object.is(old, raw)) return true;
        Reflect.set(object, key, raw);
        changed(root, [...path, String(key)], raw, old);
        return true;
      },
      deleteProperty(object, key) {
        Reflect.deleteProperty(object, key);
        changed(root, [...path, String(key)]);
        return true;
      },
    });
    rawValues.set(proxy, value);
    byPath.set(key, proxy);
    return proxy;
  }
  const machine: Machine = new Proxy(target, {
    get(object, key) {
      return observable(Reflect.get(object, key, machine), String(key));
    },
    set(object, key, value) {
      if (key === 'addresBits' || key === 'codeBits') {
        const other = key === 'addresBits' ? 'codeBits' : 'addresBits';
        if (!Number.isFinite(Number(value))) return true;
        value = clamp(Math.trunc(Number(value)), 1, Math.min(16, 30 - (object[other] || 1)));
      }
      const old: unknown = Reflect.get(object, key),
        raw = (value && typeof value === 'object' ? rawValues.get(value) : undefined) || value;
      if (Object.is(old, raw)) return true;
      Reflect.set(object, key, raw);
      changed(String(key), [], raw, old);
      return true;
    },
  });
  for (const [name, method] of Object.entries(machineMethods)) Reflect.set(target, name, method.bind(machine));
  Object.assign(target, createMicroInstructionActions(machine));
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
      setStorageItem('W', JSON.stringify(Object.fromEntries(persistedSettings.map((key) => [key, machine[key]]))));
    } catch {
      /* Storage may be unavailable or full; simulation remains usable. */
    }
  };
  target.loadFromLS = () => {
    restoring = true;
    try {
      const saved = JSON.parse(getStorageItem('W') || '{}');
      if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return;
      for (const key of persistedSettings) {
        const value = saved[key];
        if (value === undefined) continue;
        if (key === 'extras' && value && typeof value === 'object') {
          const defaults = machine.getDefaultExtras();
          for (const [name, entry] of Object.entries(defaults)) {
            if (typeof entry === 'boolean') Reflect.set(defaults, name, typeof value[name] === 'boolean' ? value[name] : entry);
            else
              for (const sub of Object.keys(entry))
                if (typeof value[name]?.[sub] === 'boolean') Reflect.set(Reflect.get(defaults, name), sub, value[name][sub]);
          }
          machine.extras = defaults;
        } else if (key === 'registerFormats' && value && typeof value === 'object') {
          for (const field of Object.keys(machine.registerFormats))
            if (formats.includes(value[field])) Reflect.set(machine.registerFormats, field, value[field]);
        } else if (key === 'numberFormat' && formats.includes(value as NumberFormat)) Reflect.set(machine, key, value);
        else if (key === 'language' && ['pl', 'en'].includes(value)) Reflect.set(machine, key, value);
        else if (typeof machine[key] === 'boolean' && typeof value === 'boolean') Reflect.set(machine, key, value);
        else if (typeof machine[key] === 'number' && Number.isFinite(value))
          Reflect.set(machine, key, clamp(value, key === 'stepDelay' ? 5 : 0, 10000));
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
    subscribe(listener: Action) {
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
      for (const key of ['wsPingTimer', 'toastTimer', 'blurHideTimer', 'errorTimeoutId', 'reconnectTimer', 'autoStepInterval'] as const) {
        clearTimeout(machine[key] ?? undefined);
        clearInterval(machine[key] ?? undefined);
      }
      machine.ws?.close();
      machine.ws = null;
      window.removeEventListener('keydown', machine.handleKeyPress);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pagehide', machine.saveToLS);
    },
  };
}
