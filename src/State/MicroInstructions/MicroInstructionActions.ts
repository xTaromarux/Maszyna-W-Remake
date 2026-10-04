import type { Machine, MicroActions } from '@/Types/Simulator';
import { aluOperations } from './AluOperations';
import { cancelDeviceOperation, deviceOperations } from './DeviceOperations';
import { executeMicroInstructions } from './ExecuteMicroInstructions';
import { interruptOperations } from './InterruptOperations';
import { memoryOperations } from './MemoryOperations';
import { registerTransfers } from './RegisterTransfers';
import { showSignalActivity } from './SignalActivity';
import { stackOperations } from './StackOperations';
import type { MicroInstructionSignal, MicroOperations } from './Types';

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
