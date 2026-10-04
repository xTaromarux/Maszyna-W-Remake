import type { Machine } from '@/Types/Simulator';
import { showSignalActivity } from './SignalActivity';
import type { MicroOperation } from './Types';

const completeDeviceOperation = (machine: Machine) => {
  machine.deviceOperationTimer = null;
  machine.DEV_BUSY = false;
  machine.DEV_READY = machine.DEV_IN ? 0 : 1;
  machine.G = machine.DEV_READY;
};

/** Cancels device work on stop/reset. Clearing signal highlights alone does not cancel it. */
export const cancelDeviceOperation = (machine: Machine) => {
  clearTimeout(machine.deviceOperationTimer ?? undefined);
  machine.deviceOperationTimer = null;

  if (machine.DEV_BUSY) {
    machine.DEV_BUSY = false;
    machine.G = machine.DEV_READY ? 1 : 0;
  }
};

export const deviceOperations = {
  wyg: (machine) => {
    const readiness = machine.DEV_READY ? 1 : 0;
    machine.BusS = readiness;
    machine.G = readiness;
  },

  werb: (machine) => {
    const output = machine.toWord(machine.ACC);
    machine.DEV_OUT = output;
    machine.RB = output;
  },

  wyrb: (machine) => {
    const canRead = machine.DEV_READY === 0;
    const input = canRead ? machine.toWord(machine.DEV_IN) : 0;
    machine.BusS = input;
    machine.RB = input;

    if (canRead) {
      machine.DEV_IN = 0;
      machine.DEV_READY = 1;
      machine.G = 1;
    }
  },

  start: (machine) => {
    if (machine.DEV_BUSY) {
      return;
    }

    machine.DEV_BUSY = true;
    machine.DEV_READY = machine.DEV_IN ? 0 : 1;

    if (machine.isFastRunning) {
      completeDeviceOperation(machine);
      return;
    }

    // Preserve the existing device delay, independently of the highlight lifetime.
    const duration = machine.oddDelay * 2;
    showSignalActivity(machine, 'start', duration);
    machine.deviceOperationTimer = setTimeout(() => completeDeviceOperation(machine), duration);
  },
} satisfies Record<string, MicroOperation>;
