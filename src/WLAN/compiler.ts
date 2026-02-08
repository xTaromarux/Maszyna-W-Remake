/* eslint-disable prefer-arrow/prefer-arrow-functions */
import type { MicroProgramEntry, Phase as RuntimePhase, MicroPhase } from './types/model';
import type { CompileExternalOptions } from './types/compiler';

export type { CompileExternalOptions } from './types/compiler';

function toMicroPhaseFromSet(set: Record<string, any>): MicroPhase {
  const p: any = {};
  for (const k of Object.keys(set)) if (set[k] === true) p[k] = true;
  if (Number.isFinite(set.srcLine)) p.srcLine = set.srcLine;
  return p as MicroPhase;
}

function tokenize(line: string): string[] {
  return line
    .split(/\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function stripLabels(tokens: string[]): { labels: string[]; rest: string[] } {
  const labels: string[] = [];
  let i = 0;
  while (i < tokens.length && tokens[i].startsWith('@')) {
    labels.push(tokens[i].slice(1));
    i++;
  }
  return { labels, rest: tokens.slice(i) };
}

function isFetchPhase(sigSet: Set<string>): boolean {
  return sigSet.has('czyt') && sigSet.has('wei') && sigSet.has('il');
}

function sigsFromTokens(tokens: string[], known: Set<string>): Record<string, boolean> {
  const set: Record<string, boolean> = {};
  for (const t of tokens) {
    const up = t.toLowerCase();
    if (up === 'koniec') break;
    if (known.has(up)) set[up] = true;
  }
  return set;
}

function parseIF(tokens: string[]) {
  const ifIdx = tokens.findIndex((t) => /^if$/i.test(t));
  if (ifIdx < 0) return null;

  const flagRaw = tokens[ifIdx + 1]?.toUpperCase();
  const thenIdx = tokens.findIndex((t, k) => k > ifIdx && /^then$/i.test(t));
  const elseIdx = tokens.findIndex((t, k) => k > ifIdx && /^else$/i.test(t));
  if (!flagRaw || thenIdx < 0 || elseIdx < 0) return null;

  const tTok = tokens[thenIdx + 1];
  const fTok = tokens[elseIdx + 1];
  if (!tTok || !fTok || !tTok.startsWith('@') || !fTok.startsWith('@')) return null;

  const flagNorm = (() => {
    const f = flagRaw;
    if (f === 'M') return 'N';
    if (f === 'NEG') return 'N';
    if (f === 'NZERO') return 'NZ';
    if (f === 'ZERO') return 'Z';
    if (f === 'POS') return 'P';
    return f;
  })();

  const prefix = tokens.slice(0, ifIdx);

  return {
    flag: flagNorm,
    trueLabel: tTok.slice(1),
    falseLabel: fTok.slice(1),
    prefix,
  };
}

export function compileCodeExternal(source: string, opts: CompileExternalOptions): { program: MicroProgramEntry[]; rawLines: string[] } {
  if (!source || !source.trim()) {
    throw new Error('Brak kodu do kompilacji.');
  }

  const { availableSignals, extras } = opts;

  const KNOWN = new Set<string>([
    ...availableSignals.always,
    ...(extras?.xRegister ? availableSignals.xRegister : []),
    ...(extras?.yRegister ? availableSignals.yRegister : []),
    ...(extras?.dl ? availableSignals.dl : []),
    ...(extras?.jamlExtras ? availableSignals.jamlExtras : []),
    ...(extras?.busConnectors ? availableSignals.busConnectors : []),
  ]);

  const rawLines = source
    .split(';')
    .map((l) => l.replace(/\r?\n/g, ' ').trim())
    .filter((l) => l.length > 0);

  const program: MicroProgramEntry[] = [];

  let current: MicroProgramEntry | null = null;
  const finishCurrent = () => {
    if (current && current.phases.length > 0) {
      program.push(current);
      current = null;
    }
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const tokens0 = tokenize(line);

    const { labels: leadingLabels, rest } = stripLabels(tokens0);

    const ifSpec = parseIF(rest);
    if (ifSpec) {
      if (!current) {
        current = { pc: program.length, asmLine: '(micro)', phases: [], meta: { kind: 'NONE' } };
      }

      const tLine = rawLines[i + 1] ?? '';
      const fLine = rawLines[i + 2] ?? '';

      const tTok = tokenize(tLine);
      const fTok = tokenize(fLine);

      const tLbl = stripLabels(tTok);
      const fLbl = stripLabels(fTok);

      const tBodyOk = tLbl.labels[0]?.toLowerCase() === ifSpec.trueLabel.toLowerCase();
      const fBodyOk = fLbl.labels[0]?.toLowerCase() === ifSpec.falseLabel.toLowerCase();

      const tSignals = tBodyOk ? sigsFromTokens(tLbl.rest, KNOWN) : {};
      const fSignals = fBodyOk ? sigsFromTokens(fLbl.rest, KNOWN) : {};

      const condPhase: any = {
        conditional: true,
        flag: ifSpec.flag,
        truePhases: tBodyOk ? [toMicroPhaseFromSet(tSignals)] : [],
        falsePhases: fBodyOk ? [toMicroPhaseFromSet(fSignals)] : [],
        srcLine: i,
        __prefix: ifSpec.prefix?.slice() || [],
      };

      if (tBodyOk && condPhase.truePhases[0]) (condPhase.truePhases[0] as any).srcLine = i + 1;
      if (fBodyOk && condPhase.falsePhases[0]) (condPhase.falsePhases[0] as any).srcLine = i + 2;

      current.phases.push(condPhase);

      if (tBodyOk) i += 1;
      if (fBodyOk) i += 1;
      continue;
    }

    for (const tok of rest) {
      const up = tok.toUpperCase();
      if (up === 'END') continue;
      if (!KNOWN.has(tok.toLowerCase())) {
        throw new Error(`Nieznany symbol "${tok}" w linii ${i + 1}: ${line}`);
      }
    }

    const sigSet = new Set(rest.map((t) => t.toLowerCase()).filter((t) => KNOWN.has(t)));

    if (isFetchPhase(sigSet)) {
      finishCurrent();
      current = { pc: program.length, asmLine: '(micro)', phases: [], meta: { kind: 'NONE' } };
    } else if (!current) {
      current = { pc: program.length, asmLine: '(micro)', phases: [], meta: { kind: 'NONE' } };
    }

    if (sigSet.size === 0) continue;

    const phaseObj: any = sigsFromTokens(rest, KNOWN);
    phaseObj.srcLine = i;
    current.phases.push(toMicroPhaseFromSet(phaseObj));

    if (phaseObj.stop) finishCurrent();
  }

  finishCurrent();

  return { program, rawLines };
}
