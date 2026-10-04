import type { AsmPipelineResult } from './Types/AsmPipeline';
import type { MicroProgramEntry } from './Types/Model';
import type { RuntimeCommand } from './Types/Registry';
import { generateMicroProgram, injectCJumpMeta } from './MicroGenerator';
import { parse } from './Parser';

function renderMicroProgram(program: MicroProgramEntry[]): string {
  const asmFragments: string[] = [];
  let lineNo = 0;

  for (const entry of program) {
    for (const phase of entry.phases) {
      if (phase.conditional === true) {
        const cond = phase;
        const flag = cond.flag;
        const labels = cond.__labels || {};
        const tLabel = labels.t || 'zero';
        const fLabel = labels.f || 'notzero';
        const prefixArr = cond.__prefix;

        const t = cond.truePhases?.[0] ?? {};
        const f = cond.falsePhases?.[0] ?? {};
        const trueSignals = Object.keys(t)
          .filter((k) => Reflect.get(t, k))
          .join(' ');
        const falseSignals = Object.keys(f)
          .filter((k) => Reflect.get(f, k))
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
        const regularPhase = phase;
        const signals = Object.keys(regularPhase)
          .filter((key) => Reflect.get(regularPhase, key) === true)
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
