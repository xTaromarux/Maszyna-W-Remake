import { useSyncExternalStore } from 'react';
import { messages } from './messages.js';
let locale = 'pl';
const listeners = new Set();
const read = (language, key) => key.split('.').reduce((value, part) => value?.[part], messages[language]);
export function translate(key, params = {}) {
  const value = read(locale, key) ?? read('en', key) ?? key;
  if (typeof value !== 'string') return key;
  return value.replace(/\{(\w+)\}/g, (match, name) => params[name] == null ? match : String(params[name]));
}
export function setLocale(value) {
  const next = Object.hasOwn(messages, value) ? value : 'en';
  if (locale !== next) { locale = next; listeners.forEach(listener => listener()); }
  if (typeof document !== 'undefined') document.documentElement.lang = locale;
  return locale;
}
const subscribe = listener => { listeners.add(listener); return () => listeners.delete(listener); };
export function useI18n() {
  const current = useSyncExternalStore(subscribe, () => locale, () => 'pl');
  return { t: translate, locale: current, setLocale };
}
