// instructionTemplates.fromCommandList.ts

import { commandList } from '../utils/data/commands';

export type Signal =
  | 'czyt' | 'wys' | 'wei' | 'il'
  | 'wyad' | 'wea' | 'wyl' | 'wel'
  | 'weja' | 'weak' | 'przep' | 'dod' | 'ode'
  | 'mno' | 'dziel'
  | 'shr' | 'shl' | 'neg' | 'lub' | 'i'
  | 'as' | 'sa'
  | 'pisz'
  | 'readIO' | 'writeIO'
  | 'call' | 'ret'
  | 'pushAcc' | 'popAcc'
  | 'wyws' | 'iws' | 'dws' | 'wyls'
  | 'wyg' | 'werb' | 'wyrb' | 'start';

export type SignalSet = Partial<Record<Signal, true>>;

export interface ConditionalPhase {
  conditional: true;
  flag: 'Z' | 'N' | 'M' | string;
  truePhases: SignalSet[];
  falsePhases: SignalSet[];
}

export type Phase = Signal[] | ConditionalPhase;
export type InstructionTemplates = Record<string, Phase[]>;

const SIGNALS: Set<string> = new Set<Signal>([
  'czyt','wys','wei','il',
  'wyad','wea','wyl','wel',
  'weja','weak','przep','dod','ode',
  'mno','dziel',
  'shr','shl','neg','lub','i',
  'as','sa',
  'pisz',
  'readIO','writeIO',
  'call','ret',
  'pushAcc','popAcc',
  'wyws','iws','dws','wyls',
  'wyg','werb','wyrb','start',
]);

type Cmd = {
  name: string;
  args: number;
  description?: string;
  lines: string;
};

function tokenizeStatements(lines: string): string[] {
  return lines
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)
    .join(' ')
    .split(';')
    .map(s => s.trim())
    .filter(Boolean);
}

function stripLabel(stmt: string): { label?: string; rest: string } {
  if (stmt.startsWith('@')) {
    const sp = stmt.indexOf(' ');
    if (sp > 0) {
      return { label: stmt.slice(1, sp), rest: stmt.slice(sp + 1).trim() };
    } else {
      return { label: stmt.slice(1), rest: '' };
    }
  }
  return { rest: stmt };
}

function stmtToSignalArray(stmt: string): Signal[] {
  const toks = stmt.split(/\s+/).map(t => t.trim()).filter(Boolean);
  const sigs: Signal[] = [];
  for (const t of toks) {
    if (SIGNALS.has(t)) sigs.push(t as Signal);
  }
  return sigs;
}

function toSignalSetArray(stmt: string): SignalSet[] {
  const arr = stmtToSignalArray(stmt);
  return arr.length ? [Object.fromEntries(arr.map(s => [s, true])) as SignalSet] : [];
}

function parseIF(stmt: string) {
  // IF Z THEN @zero ELSE @niezero
  const m = /^IF\s+([A-Za-z]+)\s+THEN\s+@([A-Za-z0-9_]+)\s+ELSE\s+@([A-Za-z0-9_]+)$/i.exec(stmt);
  if (!m) return null;
  const flag = m[1].toUpperCase();
  const tLabel = m[2];
  const fLabel = m[3];
  return { flag, tLabel, fLabel };
}

function buildConditionalPhase(flag: string, tPhases: SignalSet[], fPhases: SignalSet[]): ConditionalPhase {
  return {
    conditional: true,
    flag: (flag === 'N' ? 'N' : flag) as any,
    truePhases: tPhases.length ? tPhases : [{}],
    falsePhases: fPhases.length ? fPhases : [{}],
  };
}

function phasesFromCommand(cmd: Cmd): Phase[] {
  const stmts = tokenizeStatements(cmd.lines);
  const phases: Phase[] = [];
  const labels = new Map<string, string>();

  for (const raw of stmts) {
    const { label, rest } = stripLabel(raw);
    if (label) labels.set(label, rest);
  }

  let ifHandled = false;

  for (const raw of stmts) {
    const { label, rest } = stripLabel(raw);
    const stmt = rest;

    if (!stmt) continue;

    const ifSpec = !ifHandled ? parseIF(stmt.replace(/\s+KONIEC$/i, '')) : null;
    if (ifSpec) {
      const tStmt = labels.get(ifSpec.tLabel) ?? '';
      const fStmt = labels.get(ifSpec.fLabel) ?? '';

      const tPhases = toSignalSetArray(tStmt);
      const fPhases = toSignalSetArray(fStmt);

      // Domknięcie rozkazu w gałęzi false: jeśli brak wyl/wea, dopisz
      const needEndFalse = !/(\bwyl\b).*(\bwea\b)|(\bwea\b).*(\bwyl\b)/.test(fStmt);
      if (needEndFalse) fPhases.push({ wyl: true, wea: true });

      phases.push(buildConditionalPhase(ifSpec.flag, tPhases, fPhases));
      ifHandled = true;
      continue;
    }

    const sigs = stmtToSignalArray(stmt);
    if (sigs.length) phases.push(sigs);
  }

  return phases;
}

export const instructionTemplates: InstructionTemplates = (() => {
  const out: InstructionTemplates = {};
  for (const c of commandList as Cmd[]) {
    const key = c.name.toUpperCase();
    out[key] = phasesFromCommand(c);
  }
  return out;
})();
