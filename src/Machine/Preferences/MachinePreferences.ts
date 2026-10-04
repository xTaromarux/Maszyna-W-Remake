import type { Extras, Machine, RegisterFormats } from '../Types/Machine';
import type { NumberFormat } from '@/Shared/Types/Numbers';
import { clamp } from '@/Shared/Utils/Numbers';

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

type PersistedSetting = (typeof persistedSettings)[number];
const formats = ['dec', 'hex', 'bin'];

export const isNumberFormat = (value: unknown): value is NumberFormat => formats.includes(value as NumberFormat);

export const collectPreferences = (machine: Machine) => Object.fromEntries(persistedSettings.map((key) => [key, machine[key]]));

export const parsePreferences = (stored: string | null): Record<string, unknown> | null => {
  const saved: unknown = JSON.parse(stored || '{}');
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) {
    return null;
  }
  return saved as Record<string, unknown>;
};

/** Validates each known extras flag without importing unknown fields from storage. */
export const mergeExtraPreferences = (defaults: Extras, stored: Record<string, unknown>): Extras => {
  const merged = { ...defaults };
  for (const [name, entry] of Object.entries(defaults)) {
    if (typeof entry === 'boolean') {
      Reflect.set(merged, name, typeof stored[name] === 'boolean' ? stored[name] : entry);
      continue;
    }

    const group = { ...entry };
    const storedGroup = stored[name] as Record<string, unknown> | null | undefined;
    for (const sub of Object.keys(entry)) {
      if (typeof storedGroup?.[sub] === 'boolean') {
        Reflect.set(group, sub, storedGroup[sub]);
      }
    }
    Reflect.set(merged, name, group);
  }
  return merged;
};

/** Returns only supported formats for existing register names, preserving their iteration order. */
export const getRegisterFormatPreferences = (current: RegisterFormats, stored: Record<string, unknown>) => {
  const entries: [string, NumberFormat][] = [];
  for (const field of Object.keys(current)) {
    const value = stored[field];
    if (isNumberFormat(value)) {
      entries.push([field, value]);
    }
  }
  return entries;
};

export const validateSettingPreference = (key: PersistedSetting, value: unknown, current: unknown) => {
  if (key === 'numberFormat' && isNumberFormat(value)) {
    return value;
  }
  if (key === 'language' && (value === 'pl' || value === 'en')) {
    return value;
  }
  if (typeof current === 'boolean' && typeof value === 'boolean') {
    return value;
  }
  if (typeof current === 'number' && typeof value === 'number' && Number.isFinite(value)) {
    return clamp(value, key === 'stepDelay' ? 5 : 0, 10000);
  }
  return undefined;
};
