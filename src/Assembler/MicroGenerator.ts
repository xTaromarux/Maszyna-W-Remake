import { buildConditionalForInstr } from './ConditionalTemplate';
export { buildConditionalForInstr } from './ConditionalTemplate';
import { normalizeMnemonicToken } from '@/Assembler/CommandMnemonics';
import { translate as t } from '../I18n/Translator';
import type { IRInstruction, ProgramIR } from './Types/AssemblerIr';
import type { Signal, SignalSet, ConditionalPhase as TemplateConditionalPhase, Phase as TemplatePhase } from './Types/Instructions';
import type { CJumpMeta, Phase } from './Types/MicroGenerator';
import type { MicroPhase, MicroProgramEntry, Phase as RuntimePhase } from './Types/Model';
import type { RuntimeCommand } from './Types/Registry';
import { buildFromCommandList } from './CommandAdapter';
import { AssemblerError } from './Errors/AssemblerError';

function normalizeConditionalFlag(flag: string): string {
  return flag === 'M' ? 'N' : flag;
}

function isTemplateConditionalPhase(phase: TemplatePhase): phase is TemplateConditionalPhase {
  return !Array.isArray(phase) && (phase as TemplateConditionalPhase).conditional === true;
}

function toMicroPhaseFromSignals(signals: Signal[]): MicroPhase {
  const microPhase: MicroPhase = {};
  for (const signalName of signals) microPhase[signalName] = true;
  return microPhase;
}

function toMicroPhaseFromSignalSet(signalSet: SignalSet): MicroPhase {
  const microPhase: MicroPhase = {};
  for (const signalName in signalSet) if (signalSet[signalName as Signal]) microPhase[signalName as Signal] = true;
  return microPhase;
}

function toRuntimeTemplatePhase(phase: TemplatePhase): RuntimePhase {
  if (Array.isArray(phase)) {
    return toMicroPhaseFromSignals(phase);
  }

  if (isTemplateConditionalPhase(phase)) {
    const runtimeConditionalPhase: RuntimePhase = {
      conditional: true,
      flag: normalizeConditionalFlag(phase.flag),
      truePhases: phase.truePhases.map(toMicroPhaseFromSignalSet),
      falsePhases: phase.falsePhases.map(toMicroPhaseFromSignalSet),
    };

    if (phase.__labels) runtimeConditionalPhase.__labels = phase.__labels;
    if (phase.__prefix) runtimeConditionalPhase.__prefix = phase.__prefix;

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

  const command = executableCommands.find((candidate) => normalizeMnemonicToken(candidate.name, 'lower') === key);
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
    throw new AssemblerError(t('wlan.microGenerator.sobNoAddress'), { code: 'GEN_SOB_NO_ADDR' });
  }

  const targetPc = addressToPc.get(targetAddress);
  if (targetPc === undefined) {
    throw new AssemblerError(t('wlan.microGenerator.sobBadAddress', { targetAddress }), {
      code: 'GEN_SOB_BAD_ADDR',
    });
  }

  metadata.kind = 'JUMP';
  metadata.trueTarget = targetPc;
}

export function generateMicroProgram(ir: ProgramIR, commandList: RuntimeCommand[]): MicroProgramEntry[] {
  const executableCommands = (commandList || []).filter((command) => (command.kind || 'exec') === 'exec');

  if (!Array.isArray(executableCommands) || executableCommands.length === 0) {
    throw new AssemblerError(t('wlan.microGenerator.emptyExecList'), {
      code: 'GEN_EMPTY_CMDLIST',
    });
  }

  const { templates, postAsm } = buildFromCommandList(executableCommands);
  const instructions = Array.isArray(ir?.instructions) ? ir.instructions : [];
  const addressToPc = buildAddressToPcMap(instructions);

  const microProgram: MicroProgramEntry[] = [];

  for (let programCounter = 0; programCounter < instructions.length; programCounter++) {
    const instruction = instructions[programCounter];
    const mnemonicKey = normalizeMnemonicToken(instruction.name, 'lower');
    const templatePhases = templates[mnemonicKey];

    if (!templatePhases) {
      throw new AssemblerError(t('wlan.microGenerator.missingTemplate', { name: (instruction.name || '').toUpperCase() }), {
        code: 'GEN_NO_TEMPLATE',
        hint: t('wlan.microGenerator.missingTemplateHint'),
      });
    }

    const phases = templatePhases.map(toRuntimeTemplatePhase);
    const hasConditionalPhase = phases.some((phase) => phase.conditional === true);

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

    if (phases.some((phase) => phase.conditional === true)) {
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

    if (entry?.phases?.some((phase) => phase?.conditional === true)) {
      if (!entry.meta || entry.meta.kind === 'NONE') {
        entry.meta = { ...(entry.meta || {}), kind: 'CJUMP' };
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
      };

      if (!Array.isArray(entry.phases)) entry.phases = [];
    }
  }

  return program;
}
