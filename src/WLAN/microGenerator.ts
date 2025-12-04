import type { AstNode } from './model';
import { buildFromCommandList } from './commandAdapter';
import type { Phase as TemplatePhase, Signal, SignalSet } from './instructions';
import type { MicroProgramEntry, MicroPhase, Phase as RuntimePhase } from './model';
import { WlanError } from './error';

function toMicroPhaseFromSignals(signals: Signal[]): MicroPhase {
  const phase: MicroPhase = {};
  for (const s of signals) phase[s] = true;
  return phase;
}
function toMicroPhaseFromSignalSet(set: SignalSet): MicroPhase {
  const phase: MicroPhase = {};
  for (const k in set) if (set[k]) (phase as any)[k] = true;
  return phase;
}
const nameKey = (n: string) => (n || '').toLowerCase();

type Phase = { op: string; [k: string]: any };

type CJumpMeta = {
  kind: 'CJUMP';
  flagName: 'Z' | 'N' | 'C' | 'V' | 'M';
  trueTarget?: number;
  falseTarget?: number;
  joinTarget?: number;
  _branchLocked?: boolean;
  srcLine?: number;
};

/* IF Z THEN @zero ELSE @notzero; */
const IF_RE = /^\s*IF\s+([A-Z])\s+THEN\s+@([\p{L}\w]+)\s+ELSE\s+@([\p{L}\w]+)\s*;?\s*$/u;

function cutAtKoniec(phases: Phase[]): Phase[] {
  const i = phases.findIndex((p) => p.op === 'END' || p.op === 'END_BRANCH');
  return i >= 0 ? phases.slice(0, i) : phases;
}

function collectBetweenLabels(lines: string[], startLabel: string): string[] {
  const start = lines.findIndex((l) => new RegExp(`^\\s*@${startLabel}\\b`, 'u').test(l));
  if (start === -1) return [];
  const body: string[] = [];
  for (let i = start + 1; i < lines.length; i++) {
    if (/^\s*@[\p{L}\w]+/u.test(lines[i])) break;
    body.push(lines[i]);
  }
  return body;
}

function tokenizeLineToPhases(line: string): Phase[] {
  return line
    .split(/\s+/)
    .map((tok) => tok.trim())
    .filter(Boolean)
    .map((tok) => ({ op: tok }));
}

function linesToPhases(lines: string[]): Phase[] {
  const out: Phase[] = [];
  for (const l of lines) out.push(...tokenizeLineToPhases(l));
  return out;
}

function splitBeforeIF(lines: string[]): {
  before: string[];
  ifLineIdx: number;
} {
  const idx = lines.findIndex((l) => IF_RE.test(l));
  if (idx === -1) return { before: lines.slice(), ifLineIdx: -1 };
  return { before: lines.slice(0, idx), ifLineIdx: idx };
}

export function buildConditionalForInstr(lines: string[]): {
  meta?: CJumpMeta;
  phases?: Phase[];
  condPhase?: RuntimePhase;
} {
  const { before, ifLineIdx } = splitBeforeIF(lines);
  if (ifLineIdx === -1) return {};

  const m = lines[ifLineIdx].match(IF_RE);
  if (!m) return {};

  const flagName = (m[1] as CJumpMeta['flagName']) || 'Z';
  const trueLbl = m[2];
  const falseLbl = m[3];

  const trueLines = collectBetweenLabels(lines, trueLbl);
  const falseLines = collectBetweenLabels(lines, falseLbl);

  let truePhases = linesToPhases(trueLines);
  let falsePhases = linesToPhases(falseLines);

  truePhases = cutAtKoniec(truePhases).map((p) => (p.op === 'END' ? { op: 'END_BRANCH' } : p));
  falsePhases = cutAtKoniec(falsePhases).map((p) => (p.op === 'END' ? { op: 'END_BRANCH' } : p));

  const meta: CJumpMeta = {
    kind: 'CJUMP',
    flagName,
  };

  const phases = linesToPhases(before);

  const toMicro = (px: Phase[]): MicroPhase[] => {
    if (!px || px.length === 0) return [];
    const sigs: SignalSet = {};
    for (const p of px) {
      const op = p.op?.toLowerCase();
      if (op && op !== 'koniec' && op !== 'end_branch') sigs[op as Signal] = true;
    }
    return [toMicroPhaseFromSignalSet(sigs)];
  };

  const condPhase: RuntimePhase = {
    conditional: true,
    flag: flagName === 'M' ? 'N' : flagName,
    truePhases: toMicro(truePhases),
    falsePhases: toMicro(falsePhases),
  };

  return { meta, phases, condPhase };
}

export function generateMicroProgram(
  ast: AstNode[],
  commandList: Array<{
    name: string;
    args: number;
    description?: string;
    lines: string;
  }>
): MicroProgramEntry[] {
  if (!Array.isArray(commandList) || commandList.length === 0) {
    throw new WlanError('Pusta lista rozkazów - brak definicji do generowania mikroprogramu.', {
      code: 'GEN_EMPTY_CMDLIST',
    });
  }

  const { templates: TEMPLATES, postAsm: POSTASM } = buildFromCommandList(commandList);

  let currentAddr = 0,
    pc = 0;
  const addrToPc = new Map<number, number>();
  const instrNodes: any[] = [];

  for (const node of ast) {
    switch (node.type) {
      case 'Directive': {
        const name = (node as any).name?.toUpperCase();
        if (name === 'RST' || name === 'RPA' || name === 'DATA') {
          currentAddr += Math.max(1, (node as any).operands?.length ?? 1);
        } else if (name === 'ORG') {
          currentAddr = (node as any).operands?.[0]?.value ?? currentAddr;
        }
        break;
      }
      case 'Instruction': {
        addrToPc.set(currentAddr, pc);
        instrNodes[pc] = node;
        currentAddr += 1;
        pc += 1;
        break;
      }
      default:
        break;
    }
  }

  const program: MicroProgramEntry[] = [];

  for (let i = 0; i < instrNodes.length; i++) {
    const node = instrNodes[i];
    const key = nameKey(node.name || '');
    const template = TEMPLATES[key];

    if (!template) {
      throw new WlanError(`Brak definicji w commandList dla instrukcji "${(node.name || '').toUpperCase()}"`, {
        code: 'GEN_NO_TEMPLATE',
        hint: 'Sprawdź nazwę rozkazu w edytorze listy rozkazów lub dodaj wpis.',
      });
    }

    const asmLine =
      `${(node.name || '').toUpperCase()}` +
      `${node.operands?.length ? ' ' + node.operands.map((op: any) => op.name ?? op.value).join(', ') : ''}`;

    let phases: RuntimePhase[] = [];
    let hasConditional = false;

    phases = (template as TemplatePhase[]).map((tplPhase: TemplatePhase) => {
      if (Array.isArray(tplPhase)) return toMicroPhaseFromSignals(tplPhase as any);
      if ((tplPhase as any).conditional === true) {
        hasConditional = true;
        const flag = ((tplPhase as any).flag === 'M' ? 'N' : (tplPhase as any).flag) as 'Z' | 'N' | string;
        const rp: any = {
          conditional: true,
          flag,
          truePhases: (tplPhase as any).truePhases.map(toMicroPhaseFromSignalSet),
          falsePhases: (tplPhase as any).falsePhases.map(toMicroPhaseFromSignalSet),
        };
        if ((tplPhase as any).__labels) rp.__labels = (tplPhase as any).__labels;
        if ((tplPhase as any).__prefix) rp.__prefix = (tplPhase as any).__prefix;
        return rp as RuntimePhase;
      }
      return toMicroPhaseFromSignalSet(tplPhase as any);
    });

    if (!hasConditional) {
      const rawLines = (TEMPLATES as any)[`__raw__${key}`] as string[] | undefined;
      const fallbackLines: string[] | undefined = rawLines
        ? rawLines
        : (() => {
            const rec = commandList.find((c) => nameKey(c.name) === key);
            if (!rec?.lines) return undefined;
            return rec.lines
              .split('\n')
              .map((l) => l.replace(/;\s*$/g, '').trim())
              .filter(Boolean);
          })();

      if (fallbackLines && fallbackLines.length) {
        const parsed = buildConditionalForInstr(fallbackLines);
        if (parsed.meta && parsed.condPhase) {
          hasConditional = true;
          const beforeSet: SignalSet = {};
          for (const p of parsed.phases || []) {
            const op = p.op?.toLowerCase();
            if (op) beforeSet[op as Signal] = true;
          }
          if (Object.keys(beforeSet).length) {
            phases.unshift(toMicroPhaseFromSignalSet(beforeSet));
          }
          phases.push(parsed.condPhase);
        }
      }
    }

    const meta: MicroProgramEntry['meta'] = { kind: 'NONE' } as any;

    if ((node.name || '').toUpperCase() === 'SOB') {
      const targetAddr = node.operands?.[0]?.value;
      if (typeof targetAddr !== 'number') {
        throw new WlanError(`SOB bez adresu`, { code: 'GEN_SOB_NO_ADDR' });
      }
      const targetPc = addrToPc.get(targetAddr);
      if (targetPc === undefined) {
        throw new WlanError(`SOB -> ${targetAddr} nie wskazuje instrukcji`, {
          code: 'GEN_SOB_BAD_ADDR',
        });
      }
      (meta as any).kind = 'JUMP';
      (meta as any).trueTarget = targetPc;
    }

    if (phases.some((p) => (p as any).conditional === true)) {
      (meta as CJumpMeta).kind = 'CJUMP';
    }

    const extra = POSTASM[key];
    if (extra?.length) (meta as any).postAsm = extra.slice();

    program.push({ pc: i, asmLine, phases, meta });
  }

  return program;
}

export function injectCJumpMeta(program: MicroProgramEntry[]): MicroProgramEntry[] {
  for (let i = 0; i < program.length; i++) {
    const ent = program[i];

    if (ent?.phases?.some((p) => (p as any)?.conditional === true)) {
      if (!ent.meta || ent.meta.kind === 'NONE') {
        ent.meta = { ...(ent.meta || {}), kind: 'CJUMP' } as any;
      }
      continue;
    }

    if (typeof ent?.asmLine === 'string' && /^IF\s+/i.test(ent.asmLine)) {
      const trueTarget = i + 1;
      const falseTarget = i + 2;
      const joinTarget = i + 3;
      const m = ent.asmLine.match(/^IF\s+([A-Za-z]+)/);
      const flagName = ((m?.[1] || 'Z').toUpperCase() as CJumpMeta['flagName']) || 'Z';
      ent.meta = {
        ...(ent.meta || {}),
        kind: 'CJUMP',
        flagName,
        trueTarget,
        falseTarget,
        joinTarget,
      } as any;
      if (!Array.isArray(ent.phases)) ent.phases = [];
    }
  }
  return program;
}
