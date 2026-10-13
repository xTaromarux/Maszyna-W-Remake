import type { Action, Locale } from '@/Shared/Types/Common';
import { messages } from './Messages.js';

const PLACEHOLDER_PATTERN = /\{(\w+)\}/g;

let locale: Locale = 'pl';
const listeners = new Set<Action>();

const readMessageValue = (language: Locale, key: string): unknown => {
  let value: unknown = messages[language];

  for (const part of key.split('.')) {
    if (!value || typeof value !== 'object') {
      return undefined;
    }
    value = Reflect.get(value, part);
  }

  return value;
};

export const translate = (key: string, params: Record<string, unknown> = {}): string => {
  const value = readMessageValue(locale, key) ?? readMessageValue('en', key) ?? key;
  if (typeof value !== 'string') {
    return key;
  }

  const replacePlaceholder = (match: string, name: string): string => {
    if (params[name] == null) {
      return match;
    }
    return String(params[name]);
  };

  return value.replace(PLACEHOLDER_PATTERN, replacePlaceholder);
};

export const setLocale = (value: string): Locale => {
  const next: Locale = value === 'pl' || value === 'en' ? value : 'en';
  if (locale !== next) {
    locale = next;
    listeners.forEach((listener) => listener());
  }

  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale;
  }

  return locale;
};

export const subscribe = (listener: Action) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getLocale = (): Locale => locale;
