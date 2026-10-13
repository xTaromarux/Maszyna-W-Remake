import type { AsmPipelineResult } from './Types/AsmPipeline';
import type { ConditionalPhase, MicroProgramEntry, RuntimePhase } from './Types/Model';
import type { RuntimeCommand } from './Types/Registry';
import { generateMicroProgram, injectCJumpMeta } from './MicroGenerator';
import { parse } from './Parser';

const renderConditionalPhase = (phase: ConditionalPhase, fragments: string[], sourceLine: number): number => {
  const labels = phase.__labels || {};
  const trueLabel = labels.t || 'zero';
  const falseLabel = labels.f || 'notzero';
  const prefixSignals = phase.__prefix;
  const trueBranch = phase.truePhases?.[0] ?? {};
  const falseBranch = phase.falsePhases?.[0] ?? {};

  // Conditional branches retain all truthy properties; regular phases select only true.
  const trueSignals = Object.keys(trueBranch)
    .filter((key) => Reflect.get(trueBranch, key))
    .join(' ');
  const falseSignals = Object.keys(falseBranch)
    .filter((key) => Reflect.get(falseBranch, key))
    .join(' ');
  const prefix = prefixSignals && prefixSignals.length ? prefixSignals.join(' ') + ' ' : '';

  phase.srcLine = sourceLine;
  fragments.push(`${prefix}IF ${phase.flag} THEN @${trueLabel} ELSE @${falseLabel};`);
  sourceLine++;

  trueBranch.srcLine = sourceLine;
  fragments.push(trueSignals ? `@${trueLabel} ${trueSignals};` : `@${trueLabel};`);
  sourceLine++;

  if (falseSignals) {
    falseBranch.srcLine = sourceLine;
    fragments.push(`@${falseLabel} ${falseSignals};`);
    sourceLine++;
  }

  return sourceLine;
};

const renderRegularPhase = (phase: RuntimePhase, fragments: string[], sourceLine: number): number => {
  const signals = Object.keys(phase)
    .filter((key) => Reflect.get(phase, key) === true)
    .join(' ');

  if (signals.trim()) {
    phase.srcLine = sourceLine;
    fragments.push(`${signals};`);
    sourceLine++;
  }

  return sourceLine;
};

/** Renders the micro-assembly and assigns source-line indices to the existing phase objects. */
const renderAndAssignSourceLines = (program: MicroProgramEntry[]): string => {
  const fragments: string[] = [];
  let sourceLine = 0;

  for (const entry of program) {
    for (const phase of entry.phases) {
      sourceLine =
        phase.conditional === true
          ? renderConditionalPhase(phase, fragments, sourceLine)
          : renderRegularPhase(phase, fragments, sourceLine);
    }

    const postAssemblyLines = entry.meta?.postAsm;
    if (postAssemblyLines?.length) {
      for (const line of postAssemblyLines) {
        fragments.push(`${line};`);
        sourceLine++;
      }
    }
  }

  return fragments.join('\n');
};

export const compileAsmToMicroProgram = (source: string, commandList: RuntimeCommand[]): AsmPipelineResult => {
  const ir = parse(source, { commandList });

  let microProgram = generateMicroProgram(ir, commandList);
  microProgram = injectCJumpMeta(microProgram);

  const microAsmText = renderAndAssignSourceLines(microProgram);
  console.log('Generated micro-assembly:\n', microAsmText);

  return {
    ir,
    initAssignments: [...ir.initAssignments],
    microProgram,
    microAsmText,
  };
};
