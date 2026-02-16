/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { Phase as TemplatePhase, Signal, SignalSet, ConditionalPhase } from './types/instructions';
import type { Cmd, Built } from './types/commandAdapter';

const KNOWN: ReadonlySet<string> = new Set([
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

const IF_RE = /\bIF\s+([A-Za-z]+)\s+THEN\s+@([^\s;]+)\s+ELSE\s+@([^\s;]+)\b/i;
const IF_LINE_RE = /^\s*IF\s+([A-Za-z]+)\s+THEN\s+@([^\s;]+)\s+ELSE\s+@([^\s;]+)\s*$/i;

function cutEND(text: string): string {
  return text.replace(/\bEND\b/gi, '').trim();
}

function toSignalSet(line: string): SignalSet {
  const set: SignalSet = {};
  for (const tok of line.trim().split(/\s+/)) if (KNOWN.has(tok)) (set as any)[tok as Signal] = true;
  return set;
}

function toSignalArray(line: string): Signal[] {
  const out: Signal[] = [];
  for (const tok of line.trim().split(/\s+/)) if (KNOWN.has(tok)) out.push(tok as Signal);
  return out;
}

function splitChunkAtIF(chunk: string): { before?: string; ifPart?: string } {
  const m = IF_RE.exec(chunk);
  if (!m) return {};
  const idx = m.index;
  const before = chunk.slice(0, idx).trim().replace(/;+$/, '');
  const ifPart = chunk.slice(idx).trim().replace(/;+$/, '');
  return { before: before || undefined, ifPart };
}

function pickBranchBodyFromChunk(chunk: string, label: string): SignalSet[] {
  const re = new RegExp(`^@${label}\\s+(.+)$`, 'i');
  const mm = re.exec(chunk.trim());
  if (!mm) return [];
  const body = cutEND(mm[1]);
  const sset = toSignalSet(body);
  const any = Object.keys(sset).length > 0;
  return any ? [sset] : [];
}

export function buildFromCommandList(list: Cmd[]): Built {
  const templates: Record<string, TemplatePhase[]> = {};
  const postAsm: Record<string, string[]> = {};

  for (const cmd of list || []) {
    const key = (cmd.name || '').toLowerCase();
    const rawChunks = String(cmd.lines || '')
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean);

    const phases: TemplatePhase[] = [];
    const extras: string[] = [];

    for (let i = 0; i < rawChunks.length; i++) {
      let ln = rawChunks[i];

      const split = splitChunkAtIF(ln);
      let prefixArr: Signal[] | undefined;
      if (split.before) {
        const arr = toSignalArray(cutEND(split.before));
        if (arr.length) prefixArr = arr;
      }
      if (split.ifPart) ln = split.ifPart;

      if (IF_LINE_RE.test(ln)) {
        const m = IF_LINE_RE.exec(ln)!;
        const rawFlag = (m[1] || '').toUpperCase();
        const flag: 'Z' | 'N' | string = rawFlag === 'M' ? 'N' : rawFlag;
        const tLabel = m[2];
        const fLabel = m[3];

        const next1 = rawChunks[i + 1] ?? '';
        const next2 = rawChunks[i + 2] ?? '';

        const truePhases = pickBranchBodyFromChunk(next1, tLabel);
        const falsePhases = pickBranchBodyFromChunk(next2, fLabel);

        if (truePhases.length) i++;
        if (falsePhases.length) i++;

        const conditional: ConditionalPhase & { __labels?: any; __prefix?: Signal[] } = {
          conditional: true,
          flag,
          truePhases,
          falsePhases,
        };
        conditional.__labels = { t: tLabel, f: fLabel };
        if (prefixArr?.length) conditional.__prefix = prefixArr;

        phases.push(conditional);
        continue;
      }

      if (ln.startsWith('@')) {
        const body = cutEND(ln.replace(/^@\S+\s+/, ''));
        const arr = toSignalArray(body);
        if (arr.length) phases.push(arr);
        continue;
      }

      if (/^stop$/i.test(ln)) {
        extras.push('stop');
        continue;
      }

      const arr = toSignalArray(cutEND(ln));
      if (arr.length) phases.push(arr);
    }

    templates[key] = phases;
    if (extras.length) postAsm[key] = extras;
  }

  return { templates, postAsm };
}
