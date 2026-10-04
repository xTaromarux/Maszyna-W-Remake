import type { CommandArity } from '@/Types/Registry';
import { collectCommandAliases, normalizeMnemonicToken } from '../Shared/Utils/CommandMnemonics';
import type { InstructionRegistry, NormalizedRuntimeCommand, RuntimeCommand, RuntimeCommandKind } from '../Types/Registry';
import { WlanError } from './Error';

const BUILT_INS: RuntimeCommand[] = [
  {
    name: 'RST',
    kind: 'memory',
    args: 1,
    description: { pl: 'Rezerwuj słowo i wpisz stałą', en: 'Reserve a word initialized with a constant' },
  },
  { name: 'RPA', kind: 'memory', args: 0, description: { pl: 'Rezerwuj słowo pamięci', en: 'Reserve a memory word' } },
  { name: 'ORG', kind: 'directive', args: 1, description: { pl: 'Ustaw adres kolejnych słów', en: 'Set the address of subsequent words' } },
  {
    name: 'DATA',
    kind: 'directive',
    argsMin: 1,
    argsMax: Number.MAX_SAFE_INTEGER,
    description: { pl: 'Zapisz listę wartości w pamięci', en: 'Initialize memory with a list of values' },
  },
];

function normalizeArity(cmd: RuntimeCommand): CommandArity {
  const hasRange = typeof cmd.argsMin === 'number' || typeof cmd.argsMax === 'number';

  if (hasRange) {
    const min = Number.isFinite(cmd.argsMin) ? Number(cmd.argsMin) : Number(cmd.args ?? 0);
    const max = Number.isFinite(cmd.argsMax) ? Number(cmd.argsMax) : Number(cmd.args ?? min);

    if (min < 0 || max < 0 || min > max) {
      throw new WlanError(`Invalid command arity "${cmd.name}"`, {
        code: 'REG_BAD_ARITY',
        hint: 'Check args/argsMin/argsMax in commandList.',
      });
    }

    return { min, max };
  }

  const exact = Number.isFinite(cmd.args) ? Number(cmd.args) : 0;
  if (exact < 0) {
    throw new WlanError(`Invalid command arity "${cmd.name}"`, {
      code: 'REG_BAD_ARITY',
      hint: 'Argument count cannot be negative.',
    });
  }

  return { min: exact, max: exact };
}

function normalizeCommand(cmd: RuntimeCommand, fallbackKind: RuntimeCommandKind): NormalizedRuntimeCommand {
  const name = normalizeMnemonicToken(cmd.name);
  if (!name) {
    throw new WlanError('Found command with empty name in commandList.', {
      code: 'REG_EMPTY_NAME',
      hint: 'Every commandList entry must include a name.',
    });
  }

  const kind = (cmd.kind || fallbackKind) as RuntimeCommandKind;
  const { min, max } = normalizeArity(cmd);

  return {
    ...cmd,
    name,
    kind,
    argsMin: min,
    argsMax: max,
    args: undefined,
  };
}

function registerCommandWithAliases(byName: Map<string, NormalizedRuntimeCommand>, cmd: NormalizedRuntimeCommand): void {
  // Canonical mnemonic always wins over existing aliases.
  byName.set(cmd.name, cmd);

  const { all } = collectCommandAliases(cmd);
  for (const alias of all) {
    const key = normalizeMnemonicToken(alias, 'upper');
    if (!key || key === cmd.name) continue;
    // Alias conflicts never override existing registration.
    if (byName.has(key)) continue;
    byName.set(key, cmd);
  }
}

export function buildInstructionRegistry(commandList: RuntimeCommand[] = []): InstructionRegistry {
  const byName = new Map<string, NormalizedRuntimeCommand>();
  const canonicalEntries = new Map<string, NormalizedRuntimeCommand>();

  for (const raw of commandList || []) {
    const cmd = normalizeCommand(raw, 'exec');
    if (canonicalEntries.has(cmd.name)) {
      throw new WlanError(`Duplicate command definition "${cmd.name}"`, {
        code: 'REG_DUPLICATE',
        hint: 'Remove duplicate command name from commandList.',
      });
    }
    canonicalEntries.set(cmd.name, cmd);
    registerCommandWithAliases(byName, cmd);
  }

  for (const raw of BUILT_INS) {
    const builtin = normalizeCommand(raw, raw.kind || 'directive');
    // Built-ins always win for reserved keywords.
    canonicalEntries.set(builtin.name, builtin);
    registerCommandWithAliases(byName, builtin);
  }

  return {
    byName,
    entries: Array.from(canonicalEntries.values()),
  };
}

export function getArity(cmd: RuntimeCommand): CommandArity {
  return normalizeArity(cmd);
}
