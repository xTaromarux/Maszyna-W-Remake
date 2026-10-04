import type { IRInitAssignment, ProgramIR } from './AssemblerIr';
import type { MicroProgramEntry } from './Model';

export interface AsmPipelineResult {
  ir: ProgramIR;
  initAssignments: IRInitAssignment[];
  microProgram: MicroProgramEntry[];
  microAsmText: string;
}
