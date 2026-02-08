/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { buildFromCommandList } from './commandAdapter';
import type { ConditionalPhase as TemplateConditionalPhase, Phase as TemplatePhase, Signal, SignalSet } from './types/instructions';
import type { MicroProgramEntry, MicroPhase, Phase as RuntimePhase } from './types/model';
import type { IRInstruction, ProgramIR } from './types/assemblerIR';
import type { Phase, CJumpMeta } from './types/microGenerator';
import type { RuntimeCommand } from './types/registry';
import { WlanError } from './error';

interface TemplateConditionalWithMetadata extends TemplateConditionalPhase {
  __labels?: { t?: string; f?: string };
  __prefix?: Signal[];
}

const CONDITIONAL_LINE_RE = /^\s*IF\s+([A-Z])\s+THEN\s+@([\p{L}\w]+)\s+ELSE\s+@([\p{L}\w]+)\s*;?\s*$/u;

function normalizeMnemonic(name: string): string {
  return (name || '').toLowerCase();
}

function normalizeConditionalFlag(flag: string): string {
  return flag === 'M' ? 'N' : flag;
}

function isTemplateConditionalPhase(phase: TemplatePhase): phase is TemplateConditionalWithMetadata {
  return !Array.isArray(phase) && (phase as TemplateConditionalWithMetadata).conditional === true;
}

function toMicroPhaseFromSignals(signals: Signal[]): MicroPhase {
  const microPhase: MicroPhase = {};
  for (const signalName of signals) microPhase[signalName] = true;
  return microPhase;
}

function toMicroPhaseFromSignalSet(signalSet: SignalSet): MicroPhase {
  const microPhase: MicroPhase = {};
  for (const signalName in signalSet) if (signalSet[signalName]) (microPhase as any)[signalName] = true;
  return microPhase;
}

function trimAtEndMarker(phases: Phase[]): Phase[] {
  const endIndex = phases.findIndex((phase) => phase.op === 'END' || phase.op === 'END_BRANCH');
  return endIndex >= 0 ? phases.slice(0, endIndex) : phases;
}

function collectLabelBodyLines(lines: string[], labelName: string): string[] {
  const labelStartIndex = lines.findIndex((line) => new RegExp(`^\\s*@${labelName}\\b`, 'u').test(line));
  if (labelStartIndex === -1) return [];

  const bodyLines: string[] = [];
  for (let i = labelStartIndex + 1; i < lines.length; i++) {
    if (/^\s*@[\p{L}\w]+/u.test(lines[i])) break;
    bodyLines.push(lines[i]);
  }

  return bodyLines;
}

function tokenizeLineToOps(line: string): Phase[] {
  return line
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => ({ op: token }));
}

function flattenLinesToOps(lines: string[]): Phase[] {
  const phases: Phase[] = [];
  for (const line of lines) phases.push(...tokenizeLineToOps(line));
  return phases;
}

function splitLinesBeforeConditional(lines: string[]): { prefixLines: string[]; conditionalLineIndex: number } {
  const conditionalLineIndex = lines.findIndex((line) => CONDITIONAL_LINE_RE.test(line));
  if (conditionalLineIndex === -1) return { prefixLines: lines.slice(), conditionalLineIndex: -1 };
  return { prefixLines: lines.slice(0, conditionalLineIndex), conditionalLineIndex };
}

function opsToSingleBranchPhases(ops: Phase[]): MicroPhase[] {
  if (!ops.length) return [];

  const signalSet: SignalSet = {};
  for (const op of ops) {
    const signalName = op.op?.toLowerCase();
    if (signalName && signalName !== 'koniec' && signalName !== 'end_branch') {
      signalSet[signalName as Signal] = true;
    }
  }

  return Object.keys(signalSet).length ? [toMicroPhaseFromSignalSet(signalSet)] : [];
}

function toRuntimeTemplatePhase(phase: TemplatePhase): RuntimePhase {
  if (Array.isArray(phase)) {
    return toMicroPhaseFromSignals(phase);
  }

  if (isTemplateConditionalPhase(phase)) {
    const runtimeConditionalPhase: RuntimePhase = {
      conditional: true,
      flag: normalizeConditionalFlag(phase.flag) as any,
      truePhases: phase.truePhases.map(toMicroPhaseFromSignalSet),
      falsePhases: phase.falsePhases.map(toMicroPhaseFromSignalSet),
    };

    if (phase.__labels) (runtimeConditionalPhase as any).__labels = phase.__labels;
    if (phase.__prefix) (runtimeConditionalPhase as any).__prefix = phase.__prefix;

    return runtimeConditionalPhase;
  }

  return toMicroPhaseFromSignalSet(phase as SignalSet);
}

function buildAddressToPcMap(instructions: ProgramIR['instructions']): Map<number, number> {
  const addressToPc = new Map<number, number>();
  instructions.forEach((instruction, programCounter) => {
    addressToPc.set(instruction.address, programCounter);
  });
  return addressToPc;
}

function formatAsmLine(instruction: IRInstruction): string {
  const mnemonic = (instruction.name || '').toUpperCase();
  const operands = instruction.operands?.map((operand) => operand.value).join(', ');
  return operands ? `${mnemonic} ${operands}` : mnemonic;
}

function getRawTemplateLines(templates: Record<string, TemplatePhase[]>, key: string): string[] | undefined {
  return (templates as Record<string, unknown>)[`__raw__${key}`] as string[] | undefined;
}

function resolveFallbackLines(
  templates: Record<string, TemplatePhase[]>,
  executableCommands: RuntimeCommand[],
  key: string
): string[] | undefined {
  const rawTemplateLines = getRawTemplateLines(templates, key);
  if (rawTemplateLines?.length) return rawTemplateLines;

  const command = executableCommands.find((candidate) => normalizeMnemonic(candidate.name) === key);
  if (!command?.lines) return undefined;

  return command.lines
    .split('\n')
    .map((line) => line.replace(/;\s*$/g, '').trim())
    .filter(Boolean);
}

function prependPrefixSignals(runtimePhases: RuntimePhase[], prefixOps?: Phase[]): void {
  if (!prefixOps?.length) return;

  const prefixSignalSet: SignalSet = {};
  for (const op of prefixOps) {
    const signalName = op.op?.toLowerCase();
    if (signalName) prefixSignalSet[signalName as Signal] = true;
  }

  if (Object.keys(prefixSignalSet).length) {
    runtimePhases.unshift(toMicroPhaseFromSignalSet(prefixSignalSet));
  }
}

function applySobJumpMetadata(
  metadata: NonNullable<MicroProgramEntry['meta']>,
  instruction: IRInstruction,
  addressToPc: Map<number, number>
): void {
  const targetAddress = instruction.operands?.[0]?.value;
  if (typeof targetAddress !== 'number') {
    throw new WlanError('SOB bez adresu', { code: 'GEN_SOB_NO_ADDR' });
  }

  const targetPc = addressToPc.get(targetAddress);
  if (targetPc === undefined) {
    throw new WlanError(`SOB -> ${targetAddress} nie wskazuje instrukcji`, {
      code: 'GEN_SOB_BAD_ADDR',
    });
  }

  metadata.kind = 'JUMP';
  metadata.trueTarget = targetPc;
}

export function buildConditionalForInstr(lines: string[]): {
  meta?: CJumpMeta;
  phases?: Phase[];
  condPhase?: RuntimePhase;
} {
  const { prefixLines, conditionalLineIndex } = splitLinesBeforeConditional(lines);
  if (conditionalLineIndex === -1) return {};

  const conditionalLine = lines[conditionalLineIndex];
  const match = conditionalLine.match(CONDITIONAL_LINE_RE);
  if (!match) return {};

  const flagName = (match[1] as CJumpMeta['flagName']) || 'Z';
  const trueLabel = match[2];
  const falseLabel = match[3];

  const trueBranchLines = collectLabelBodyLines(lines, trueLabel);
  const falseBranchLines = collectLabelBodyLines(lines, falseLabel);

  const trueBranchOps = trimAtEndMarker(flattenLinesToOps(trueBranchLines));
  const falseBranchOps = trimAtEndMarker(flattenLinesToOps(falseBranchLines));

  const condPhase: RuntimePhase = {
    conditional: true,
    flag: normalizeConditionalFlag(flagName) as any,
    truePhases: opsToSingleBranchPhases(trueBranchOps),
    falsePhases: opsToSingleBranchPhases(falseBranchOps),
  };

  return {
    meta: { kind: 'CJUMP', flagName },
    phases: flattenLinesToOps(prefixLines),
    condPhase,
  };
}

export function generateMicroProgram(ir: ProgramIR, commandList: RuntimeCommand[]): MicroProgramEntry[] {
  const executableCommands = (commandList || []).filter((command) => (command.kind || 'exec') === 'exec');

  if (!Array.isArray(executableCommands) || executableCommands.length === 0) {
    throw new WlanError('Pusta lista rozkazów wykonawczych - brak definicji do generowania mikroprogramu.', {
      code: 'GEN_EMPTY_CMDLIST',
    });
  }

  const { templates, postAsm } = buildFromCommandList(executableCommands as any);
  const instructions = Array.isArray(ir?.instructions) ? ir.instructions : [];
  const addressToPc = buildAddressToPcMap(instructions);

  const microProgram: MicroProgramEntry[] = [];

  for (let programCounter = 0; programCounter < instructions.length; programCounter++) {
    const instruction = instructions[programCounter];
    const mnemonicKey = normalizeMnemonic(instruction.name || '');
    const templatePhases = templates[mnemonicKey];

    if (!templatePhases) {
      throw new WlanError(`Brak definicji w commandList dla instrukcji "${(instruction.name || '').toUpperCase()}"`, {
        code: 'GEN_NO_TEMPLATE',
        hint: 'Sprawdź nazwę rozkazu w edytorze listy rozkazów lub dodaj wpis.',
      });
    }

    const phases = templatePhases.map(toRuntimeTemplatePhase);
    const hasConditionalPhase = phases.some((phase) => (phase as any).conditional === true);

    if (!hasConditionalPhase) {
      const fallbackLines = resolveFallbackLines(templates, executableCommands, mnemonicKey);
      if (fallbackLines?.length) {
        const parsedConditional = buildConditionalForInstr(fallbackLines);
        if (parsedConditional.meta && parsedConditional.condPhase) {
          prependPrefixSignals(phases, parsedConditional.phases);
          phases.push(parsedConditional.condPhase);
        }
      }
    }

    const metadata: NonNullable<MicroProgramEntry['meta']> = { kind: 'NONE' };

    if ((instruction.name || '').toUpperCase() === 'SOB') {
      applySobJumpMetadata(metadata, instruction, addressToPc);
    }

    if (phases.some((phase) => (phase as any).conditional === true)) {
      metadata.kind = 'CJUMP';
    }

    const extraPostAsm = postAsm[mnemonicKey];
    if (extraPostAsm?.length) metadata.postAsm = extraPostAsm.slice();

    microProgram.push({
      pc: programCounter,
      asmLine: formatAsmLine(instruction),
      phases,
      meta: metadata,
    });
  }

  return microProgram;
}

export function injectCJumpMeta(program: MicroProgramEntry[]): MicroProgramEntry[] {
  for (let programCounter = 0; programCounter < program.length; programCounter++) {
    const entry = program[programCounter];

    if (entry?.phases?.some((phase) => (phase as any)?.conditional === true)) {
      if (!entry.meta || entry.meta.kind === 'NONE') {
        entry.meta = { ...(entry.meta || {}), kind: 'CJUMP' } as any;
      }
      continue;
    }

    if (typeof entry?.asmLine === 'string' && /^IF\s+/i.test(entry.asmLine)) {
      const trueTarget = programCounter + 1;
      const falseTarget = programCounter + 2;
      const joinTarget = programCounter + 3;
      const flagMatch = entry.asmLine.match(/^IF\s+([A-Za-z]+)/);
      const flagName = ((flagMatch?.[1] || 'Z').toUpperCase() as CJumpMeta['flagName']) || 'Z';

      entry.meta = {
        ...(entry.meta || {}),
        kind: 'CJUMP',
        flagName,
        trueTarget,
        falseTarget,
        joinTarget,
      } as any;

      if (!Array.isArray(entry.phases)) entry.phases = [];
    }
  }

  return program;
}
