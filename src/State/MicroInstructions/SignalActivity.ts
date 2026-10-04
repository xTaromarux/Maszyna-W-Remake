import type { Machine } from '@/Types/Simulator';
import type { MicroInstructionSignal } from './Types';

type Bus = 'A' | 'S';

const SIGNAL_BUSES: Partial<Record<MicroInstructionSignal, readonly Bus[]>> = {
  wyl: ['A'],
  wel: ['A'],
  wyad: ['A'],
  wea: ['A'],
  wyws: ['A'],
  wyap: ['A'],
  weap: ['A'],
  ustrm: ['A'],
  czrm: ['A'],
  wei: ['S'],
  weja: ['S'],
  wyak: ['S'],
  wyx: ['S'],
  wex: ['S'],
  wyy: ['S'],
  wey: ['S'],
  wes: ['S'],
  wys: ['S'],
  wyls: ['S'],
  wyg: ['S'],
  wyrb: ['S'],
  werm: ['S'],
  wyrm: ['S'],
  werz: ['S'],
  wyrz: ['S'],
  werp: ['S'],
  wyrp: ['S'],
  as: ['A', 'S'],
  sa: ['A', 'S'],
};

/** Highlights a signal and its buses without changing processor or device state. Fast mode skips presentation. */
export const showSignalActivity = (machine: Machine, signal: MicroInstructionSignal, duration = machine.oddDelay) => {
  if (machine.isFastRunning) {
    return;
  }

  machine.signals[signal] = true;

  const timer = setTimeout(() => {
    machine.signals[signal] = false;
    const timerIndex = machine.activeTimeouts.indexOf(timer);
    if (timerIndex !== -1) {
      machine.activeTimeouts.splice(timerIndex, 1);
    }
  }, duration);

  machine.activeTimeouts.push(timer);

  for (const bus of SIGNAL_BUSES[signal] ?? []) {
    machine.holdBus(bus);
  }
};
