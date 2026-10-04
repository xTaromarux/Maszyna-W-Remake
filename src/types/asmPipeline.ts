import type { IRInitAssignment, ProgramIR } from './assemblerIR';
import type { MicroProgramEntry } from './model';

export interface AsmPipelineResult {
  ir: ProgramIR;
  initAssignments: IRInitAssignment[];
  microProgram: MicroProgramEntry[];
  microAsmText: string;
}
