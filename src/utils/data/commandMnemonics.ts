export type MnemonicLocaleMap = Record<string, string | string[]>;

export interface CommandMnemonicLike {
  name?: unknown;
  mnemonics?: MnemonicLocaleMap;
}

export interface CommandAliasCollection {
  canonical: string;
  preferred: string[];
  all: string[];
  byLocale: Record<string, string[]>;
}

function toLocaleKey(locale: unknown): string {
  return String(locale ?? '')
    .trim()
    .toLowerCase()
    .replace(/_/g, '-');
}

function toMnemonicList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => normalizeMnemonicToken(v, 'upper')).filter(Boolean);
  const one = normalizeMnemonicToken(value, 'upper');
  return one ? [one] : [];
}

function pushUnique(target: string[], values: string[]) {
  for (const value of values) {
    if (!value) continue;
    if (!target.includes(value)) target.push(value);
  }
}

export function normalizeLocaleChain(locale?: string): string[] {
  const normalized = toLocaleKey(locale);
  if (!normalized) return [];

  const parts = normalized.split('-').filter(Boolean);
  const chain: string[] = [];

  for (let size = parts.length; size > 0; size--) {
    const key = parts.slice(0, size).join('-');
    if (!chain.includes(key)) chain.push(key);
  }

  return chain;
}

export function normalizeMnemonicToken(token: unknown, casing: 'upper' | 'lower' = 'upper'): string {
  const trimmed = String(token ?? '').trim();
  if (!trimmed) return '';
  return casing === 'lower' ? trimmed.toLowerCase() : trimmed.toUpperCase();
}

export function collectCommandAliases(command: CommandMnemonicLike, options: { locale?: string } = {}): CommandAliasCollection {
  const canonical = normalizeMnemonicToken(command?.name, 'upper');
  if (!canonical) {
    return {
      canonical: '',
      preferred: [],
      all: [],
      byLocale: {},
    };
  }

  const byLocale: Record<string, string[]> = {};
  const customLocaleMap = command?.mnemonics || {};

  const addLocaleAliases = (localeKey: unknown, value: unknown) => {
    const key = toLocaleKey(localeKey);
    if (!key) return;

    const aliases = toMnemonicList(value).filter((alias) => alias && alias !== canonical);
    if (!aliases.length) return;

    if (!byLocale[key]) byLocale[key] = [];
    pushUnique(byLocale[key], aliases);
  };

  for (const [localeKey, value] of Object.entries(customLocaleMap)) {
    addLocaleAliases(localeKey, value);
  }

  const preferred: string[] = [];
  const localeChain = normalizeLocaleChain(options.locale);
  for (const localeKey of [...localeChain, 'default']) {
    if (!byLocale[localeKey]) continue;
    pushUnique(preferred, byLocale[localeKey]);
  }
  if (!preferred.length) preferred.push(canonical);

  const all = [canonical];
  for (const aliases of Object.values(byLocale)) {
    pushUnique(all, aliases);
  }

  return {
    canonical,
    preferred,
    all,
    byLocale,
  };
}
