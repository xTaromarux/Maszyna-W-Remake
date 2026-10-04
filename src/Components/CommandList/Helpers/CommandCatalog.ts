import { normalizeMnemonicToken } from '@/Shared/Utils/CommandMnemonics';
import type { RuntimeCommand } from '@/Types/Registry';

export const findDuplicateNames = (commands: RuntimeCommand[]): Set<string> => {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const command of commands) {
    const key = normalizeMnemonicToken(command.name, 'lower');
    if (seen.has(key)) {
      duplicates.add(command.name.trim());
    }
    seen.add(key);
  }

  return duplicates;
};

const isRecord = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);

const isArity = (value: unknown): boolean =>
  value === undefined || (typeof value === 'number' && Number.isSafeInteger(value) && value >= 0);

const isStringRecord = (value: unknown): boolean => isRecord(value) && Object.values(value).every((entry) => typeof entry === 'string');

const isCommand = (value: unknown): value is RuntimeCommand => {
  if (!isRecord(value) || typeof value.name !== 'string' || !value.name.trim()) {
    return false;
  }

  const validLines = value.lines == null || typeof value.lines === 'string';
  const validKind = value.kind == null || ['exec', 'memory', 'directive'].includes(String(value.kind));
  const validDescription = value.description === undefined || typeof value.description === 'string' || isStringRecord(value.description);
  const validMnemonics =
    value.mnemonics === undefined ||
    (isRecord(value.mnemonics) &&
      Object.values(value.mnemonics).every(
        (entry) => typeof entry === 'string' || (Array.isArray(entry) && entry.every((token) => typeof token === 'string'))
      ));

  return validLines && validKind && validDescription && validMnemonics && [value.args, value.argsMin, value.argsMax].every(isArity);
};

/** Validates the complete imported catalog before exposing any of it to the editor. */
export const parseCommandCatalog = (contents: string): RuntimeCommand[] => {
  const parsed: unknown = JSON.parse(contents);
  if (!Array.isArray(parsed) || !parsed.every(isCommand)) {
    throw new Error('Invalid command list');
  }

  return parsed.map((command) => ({ ...command, kind: command.kind || 'exec', lines: command.lines || '' }));
};
