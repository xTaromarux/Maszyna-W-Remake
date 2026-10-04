import type { Machine, MicroActions } from '@/types/simulator';
import { aluOperations } from './aluOperations';
import { cancelDeviceOperation, deviceOperations } from './deviceOperations';
import { executeMicroInstructions } from './executeMicroInstructions';
import { interruptOperations } from './interruptOperations';
import { memoryOperations } from './memoryOperations';
import { registerTransfers } from './registerTransfers';
import { showSignalActivity } from './signalActivity';
import { stackOperations } from './stackOperations';
import type { MicroInstructionSignal, MicroOperations } from './types';

const operations = {
  ...registerTransfers,
  ...aluOperations,
  ...memoryOperations,
  ...stackOperations,
  ...deviceOperations,
  ...interruptOperations,

  stop: (machine) => {
    machine._stopRun();
    machine.codeCompiled = false;
    machine.nextLine.clear();
    machine._pendingStackWrite = null;
    machine._pendingStackRead = null;
  },
} satisfies MicroOperations;

/** Adapts explicit machine operations to the store's existing no-argument actions. Each mutation runs once. */
export const createMicroInstructionActions = (machine: Machine): MicroActions => {
  const signals = Object.keys(operations) as MicroInstructionSignal[];

  const signalActions = Object.fromEntries(
    signals.map((signal) => [
      signal,
      () => {
        // START owns its busy guard and device delay; other signals have presentation only.
        if (signal !== 'start') {
          showSignalActivity(machine, signal);
        }

        operations[signal](machine);
      },
    ])
  ) as Pick<MicroActions, MicroInstructionSignal>;

  return {
    ...signalActions,
    executeSignalsFromNextLine: () => executeMicroInstructions(machine),
    cancelDeviceOperation: () => cancelDeviceOperation(machine),
  };
};
