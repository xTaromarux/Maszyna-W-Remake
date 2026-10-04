import type { Machine, MicroActions } from '@/types/simulator';

export type MicroInstructionSignal = Exclude<keyof MicroActions, 'executeSignalsFromNextLine' | 'cancelDeviceOperation'>;
export type MicroOperation = (machine: Machine) => void;
export type MicroOperations = Record<MicroInstructionSignal, MicroOperation>;
