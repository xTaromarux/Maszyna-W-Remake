import type { Machine } from '@/Machine/Types/Machine';
import { captureStackPhase, completeStackPhase } from './StackOperations';
import type { MicroInstructionSignal } from './Types';

// This is hardware execution order, not source-text order: reads feed buses, transfers feed the ALU,
// and ALU results feed destinations. Later signals see earlier writes in the same phase.
export const MICRO_INSTRUCTION_ORDER = [
  'wyl',
  'czyt',
  'pisz',
  'wys',
  'stop',
  'wyad',
  'wyak',
  'wyx',
  'wyy',
  'wyws',
  'wyls',
  'wyg',
  'wyrb',
  'wyap',
  'wyrm',
  'wyrz',
  'wyrp',
  'sa',
  'as',
  'wea',
  'weja',
  'wex',
  'wey',
  'wes',
  'wei',
  'wel',
  'werm',
  'weap',
  'werz',
  'werp',
  'dod',
  'ode',
  'przep',
  'mno',
  'dziel',
  'shr',
  'shl',
  'neg',
  'lub',
  'i',
  'iak',
  'dak',
  'weak',
  'il',
  'dl',
  'iws',
  'dws',
  'werb',
  'start',
  'ustrm',
  'czrm',
] as const satisfies readonly MicroInstructionSignal[];

/** Executes one phase in fixed order, then reconciles stack metadata. Device operations own their timing. */
export const executeMicroInstructions = (machine: Machine) => {
  if (!machine.isFastRunning) {
    machine.clearActiveTimeouts();
  }

  const stackPhase = captureStackPhase(machine);

  for (const signal of MICRO_INSTRUCTION_ORDER) {
    if (!machine.nextLine.has(signal)) {
      continue;
    }

    machine[signal]();

    if (signal === 'stop') {
      return;
    }
  }

  completeStackPhase(machine, stackPhase);
  machine.nextLine.clear();
};
