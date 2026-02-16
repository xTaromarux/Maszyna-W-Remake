/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { parse } from './parser';
import { generateMicroProgram, injectCJumpMeta } from './microGenerator';
import type { ProgramIR, IRInitAssignment } from './types/assemblerIR';
import type { RuntimeCommand } from './types/registry';
import type { MicroProgramEntry } from './types/model';

export interface AsmPipelineResult {
  ir: ProgramIR;
  initAssignments: IRInitAssignment[];
  microProgram: MicroProgramEntry[];
  microAsmText: string;
}

function renderMicroProgram(program: MicroProgramEntry[]): string {
  const asmFragments: string[] = [];
  let lineNo = 0;

  for (const entry of program) {
    for (const phase of entry.phases) {
      if ((phase as any).conditional === true) {
        const cond = phase as any;
        const flag = cond.flag;
        const labels = cond.__labels || {};
        const tLabel = labels.t || 'zero';
        const fLabel = labels.f || 'notzero';
        const prefixArr = cond.__prefix;

        const t = cond.truePhases?.[0] ?? {};
        const f = cond.falsePhases?.[0] ?? {};
        const trueSignals = Object.keys(t)
          .filter((k) => t[k])
          .join(' ');
        const falseSignals = Object.keys(f)
          .filter((k) => f[k])
          .join(' ');

        const prefix = prefixArr && prefixArr.length ? prefixArr.join(' ') + ' ' : '';

        cond.srcLine = lineNo;
        asmFragments.push(`${prefix}IF ${flag} THEN @${tLabel} ELSE @${fLabel};`);
        lineNo++;

        t.srcLine = lineNo;
        asmFragments.push(trueSignals ? `@${tLabel} ${trueSignals};` : `@${tLabel};`);
        lineNo++;

        if (falseSignals) {
          f.srcLine = lineNo;
          asmFragments.push(`@${fLabel} ${falseSignals};`);
          lineNo++;
        }
      } else {
        const regularPhase = phase as Record<string, any>;
        const signals = Object.keys(regularPhase)
          .filter((key) => regularPhase[key] === true)
          .join(' ');

        if (signals.trim()) {
          regularPhase.srcLine = lineNo;
          asmFragments.push(`${signals};`);
          lineNo++;
        }
      }
    }

    const extra = entry.meta?.postAsm;
    if (extra?.length) {
      for (const line of extra) {
        asmFragments.push(`${line};`);
        lineNo++;
      }
    }
  }

  return asmFragments.join('\n');
}

export function compileAsmToMicroProgram(source: string, commandList: RuntimeCommand[]): AsmPipelineResult {
  const ir = parse(source, { commandList });

  let microProgram = generateMicroProgram(ir, commandList);
  microProgram = injectCJumpMeta(microProgram);

  const microAsmText = renderMicroProgram(microProgram);
  console.log('Generated micro-assembly:\n', microAsmText);

  return {
    ir,
    initAssignments: [...ir.initAssignments],
    microProgram,
    microAsmText,
  };
}
