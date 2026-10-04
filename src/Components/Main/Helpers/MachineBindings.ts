import type { ExecutionControlsProps, MaszynaWProps, RegisterUpdates } from '@/Types/Components';
import type { Machine, MachineRegisters, MachineState } from '@/Types/Simulator';

export type UpdateMachineField = <K extends keyof MachineState>(field: K) => (value: MachineState[K]) => void;

/** Writes through the observable machine so settings, broadcasts, and subscriptions remain active. */
export const createMachineUpdater =
  (state: MachineState): UpdateMachineField =>
  (field) =>
  (value) => {
    state[field] = value;
  };

export const createExecutionBindings = (machine: Machine): ExecutionControlsProps => ({
  manualMode: machine.manualMode,
  codeCompiled: machine.codeCompiled,
  code: machine.code,
  isRunning: machine.isRunning,
  isFastRunning: machine.isFastRunning,
  fastProgress: machine.fastProgress,
  onCompile: machine.compileCode,
  onEdit: machine.uncompileCode,
  onStep: machine.executeLine,
  onRun: machine.runCode,
  onRunFast: machine.runToEndFast,
  onStop: machine.stopRun,
});

type RegisterBindings = Omit<MachineRegisters, 'BusA' | 'BusS'> & RegisterUpdates & Pick<MaszynaWProps, 'mem' | 'onUpdateMem'>;

export const createRegisterBindings = (machine: Machine, update: UpdateMachineField): RegisterBindings => ({
  programCounter: machine.programCounter,
  onUpdateProgramCounter: update('programCounter'),
  I: machine.I,
  onUpdateI: update('I'),
  ACC: machine.ACC,
  onUpdateACC: update('ACC'),
  JAML: machine.JAML,
  onUpdateJAML: update('JAML'),
  A: machine.A,
  onUpdateA: update('A'),
  S: machine.S,
  onUpdateS: update('S'),
  mem: machine.mem,
  onUpdateMem: update('mem'),
  X: machine.X,
  onUpdateX: update('X'),
  Y: machine.Y,
  onUpdateY: update('Y'),
  RB: machine.RB,
  onUpdateRB: update('RB'),
  G: machine.G,
  onUpdateG: update('G'),
  RZ: machine.RZ,
  onUpdateRZ: update('RZ'),
  RP: machine.RP,
  onUpdateRP: update('RP'),
  RM: machine.RM,
  onUpdateRM: update('RM'),
  AP: machine.AP,
  onUpdateAP: update('AP'),
  WS: machine.WS,
  onUpdateWS: update('WS'),
});
