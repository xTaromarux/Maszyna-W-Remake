import type { Action, Locale } from '@/types/common';
import { useSyncExternalStore } from 'react';
import { messages } from './messages.js';
let locale: Locale = 'pl';
const listeners = new Set<Action>();
const read = (language: Locale, key: string): unknown =>
  key
    .split('.')
    .reduce<unknown>((value, part) => (value && typeof value === 'object' ? Reflect.get(value, part) : undefined), messages[language]);
export function translate(key: string, params: Record<string, unknown> = {}): string {
  const value = read(locale, key) ?? read('en', key) ?? key;
  if (typeof value !== 'string') return key;
  return value.replace(/\{(\w+)\}/g, (match, name) => (params[name] == null ? match : String(params[name])));
}
export function setLocale(value: string): Locale {
  const next: Locale = value === 'pl' || value === 'en' ? value : 'en';
  if (locale !== next) {
    locale = next;
    listeners.forEach((listener) => listener());
  }
  if (typeof document !== 'undefined') document.documentElement.lang = locale;
  return locale;
}
const subscribe = (listener: Action) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export function useI18n() {
  const current = useSyncExternalStore(
    subscribe,
    () => locale,
    () => 'pl'
  );
  return { t: translate, locale: current, setLocale };
}
