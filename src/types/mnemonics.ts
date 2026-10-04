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

export interface CommandAliasOptions {
  locale?: string;
}
