import type { ConditionalChunk } from '@/Assembler/Types/CommandAdapter';
import type { RuntimeCommand } from '@/Assembler/Types/Registry';
import type { Built } from './Types/CommandAdapter';
import type { ConditionalPhase, Signal, SignalSet, TemplatePhase } from './Types/Instructions';

const KNOWN_SIGNALS: ReadonlySet<string> = new Set([
  'czyt',
  'wys',
  'wei',
  'il',
  'wyad',
  'wea',
  'wyl',
  'wel',
  'weja',
  'weak',
  'przep',
  'dod',
  'ode',
  'mno',
  'dziel',
  'shr',
  'shl',
  'neg',
  'lub',
  'i',
  'as',
  'sa',
  'pisz',
  'wes',
  'wyak',
  'wyws',
  'iws',
  'wyg',
  'werb',
  'wyrb',
  'wyls',
  'dws',
  'start',
  'werm',
  'werz',
  'wyrz',
  'werp',
  'wyrm',
  'weap',
  'wyap',
  'readIO',
  'writeIO',
  'call',
  'ret',
  'pushAcc',
  'popAcc',
]);

const CONDITIONAL_CHUNK_PATTERN = /\bIF\s+([A-Za-z]+)\s+THEN\s+@([^\s;]+)\s+ELSE\s+@([^\s;]+)\b/i;
const CONDITIONAL_LINE_PATTERN = /^\s*IF\s+([A-Za-z]+)\s+THEN\s+@([^\s;]+)\s+ELSE\s+@([^\s;]+)\s*$/i;

const removeEndMarkers = (text: string): string => text.replace(/\bEND\b/gi, '').trim();

const toSignalSet = (line: string): SignalSet => {
  const set: SignalSet = {};
  for (const token of line.trim().split(/\s+/)) {
    if (KNOWN_SIGNALS.has(token)) {
      set[token as Signal] = true;
    }
  }
  return set;
};

const toSignalArray = (line: string): Signal[] => {
  const out: Signal[] = [];
  for (const token of line.trim().split(/\s+/)) {
    if (KNOWN_SIGNALS.has(token)) {
      out.push(token as Signal);
    }
  }
  return out;
};

const splitChunkAtConditional = (chunk: string): ConditionalChunk => {
  const m = CONDITIONAL_CHUNK_PATTERN.exec(chunk);
  if (!m) {
    return {};
  }
  const idx = m.index;
  const before = chunk.slice(0, idx).trim().replace(/;+$/, '');
  const ifPart = chunk.slice(idx).trim().replace(/;+$/, '');
  return { before: before || undefined, ifPart };
};

const readBranchFromChunk = (chunk: string, label: string): SignalSet[] => {
  const re = new RegExp(`^@${label}\\s+(.+)$`, 'i');
  const mm = re.exec(chunk.trim());
  if (!mm) {
    return [];
  }
  const body = removeEndMarkers(mm[1]);
  const sset = toSignalSet(body);
  const any = Object.keys(sset).length > 0;
  return any ? [sset] : [];
};

/** Consumes branch chunks only when they contain known signals. */
const parseConditionalChunk = (
  chunk: string,
  chunks: string[],
  index: number,
  prefixSignals?: Signal[]
): { phase: ConditionalPhase; consumedChunks: number } | undefined => {
  const match = CONDITIONAL_LINE_PATTERN.exec(chunk);
  if (!match) {
    return undefined;
  }
  const rawFlag = (match[1] || '').toUpperCase();
  const flag: 'Z' | 'N' | string = rawFlag === 'M' ? 'N' : rawFlag;
  const trueLabel = match[2];
  const falseLabel = match[3];

  const trueBranchChunk = chunks[index + 1] ?? '';
  const falseBranchChunk = chunks[index + 2] ?? '';

  const truePhases = readBranchFromChunk(trueBranchChunk, trueLabel);
  const falsePhases = readBranchFromChunk(falseBranchChunk, falseLabel);

  const consumedChunks = Number(truePhases.length > 0) + Number(falsePhases.length > 0);

  const conditional: ConditionalPhase = {
    conditional: true,
    flag,
    truePhases,
    falsePhases,
  };
  conditional.__labels = { t: trueLabel, f: falseLabel };
  if (prefixSignals?.length) {
    conditional.__prefix = prefixSignals;
  }

  return { phase: conditional, consumedChunks };
};

const buildCommandTemplate = (command: RuntimeCommand): { phases: TemplatePhase[]; extras: string[] } => {
  const rawChunks = String(command.lines || '')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);

  const phases: TemplatePhase[] = [];
  const extras: string[] = [];

  for (let i = 0; i < rawChunks.length; i++) {
    let chunk = rawChunks[i];

    const split = splitChunkAtConditional(chunk);
    let prefixSignals: Signal[] | undefined;
    if (split.before) {
      const signals = toSignalArray(removeEndMarkers(split.before));
      if (signals.length) {
        prefixSignals = signals;
      }
    }
    if (split.ifPart) {
      chunk = split.ifPart;
    }

    const conditional = parseConditionalChunk(chunk, rawChunks, i, prefixSignals);
    if (conditional) {
      phases.push(conditional.phase);
      i += conditional.consumedChunks;
      continue;
    }

    if (chunk.startsWith('@')) {
      const body = removeEndMarkers(chunk.replace(/^@\S+\s+/, ''));
      const signals = toSignalArray(body);
      if (signals.length) {
        phases.push(signals);
      }
      continue;
    }

    if (/^stop$/i.test(chunk)) {
      extras.push('stop');
      continue;
    }

    const signals = toSignalArray(removeEndMarkers(chunk));
    if (signals.length) {
      phases.push(signals);
    }
  }

  return { phases, extras };
};

export const buildFromCommandList = (list: RuntimeCommand[]): Built => {
  const templates: Record<string, TemplatePhase[]> = {};
  const postAsm: Record<string, string[]> = {};

  for (const command of list || []) {
    const key = (command.name || '').toLowerCase();
    const { phases, extras } = buildCommandTemplate(command);
    templates[key] = phases;
    if (extras.length) {
      postAsm[key] = extras;
    }
  }

  return { templates, postAsm };
};
