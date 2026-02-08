/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { WlanError } from './error';
import type { InstructionRegistry, NormalizedRuntimeCommand, RuntimeCommand, RuntimeCommandKind } from './types/registry';

const BUILT_INS: RuntimeCommand[] = [
  { name: 'RST', kind: 'memory', args: 1 },
  { name: 'RPA', kind: 'memory', args: 0 },
  { name: 'ORG', kind: 'directive', args: 1 },
  { name: 'DATA', kind: 'directive', argsMin: 1, argsMax: Number.MAX_SAFE_INTEGER },
];

function toUpperName(name: unknown): string {
  return String(name || '')
    .trim()
    .toUpperCase();
}

function normalizeArity(cmd: RuntimeCommand): { min: number; max: number } {
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
  const name = toUpperName(cmd.name);
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

export function buildInstructionRegistry(commandList: RuntimeCommand[] = []): InstructionRegistry {
  const byName = new Map<string, NormalizedRuntimeCommand>();

  for (const raw of commandList || []) {
    const cmd = normalizeCommand(raw, 'exec');
    if (byName.has(cmd.name)) {
      throw new WlanError(`Duplicate command definition "${cmd.name}"`, {
        code: 'REG_DUPLICATE',
        hint: 'Remove duplicate command name from commandList.',
      });
    }
    byName.set(cmd.name, cmd);
  }

  for (const raw of BUILT_INS) {
    const builtin = normalizeCommand(raw, raw.kind || 'directive');
    // Built-ins always win for reserved keywords.
    byName.set(builtin.name, builtin);
  }

  return {
    byName,
    entries: Array.from(byName.values()),
  };
}

export function getArity(cmd: RuntimeCommand): { min: number; max: number } {
  return normalizeArity(cmd);
}
