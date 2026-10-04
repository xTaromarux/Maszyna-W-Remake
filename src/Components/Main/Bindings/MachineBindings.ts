import type { ExecutionControlsProps } from '@/Components/MicrocodeEditor/Types';
import type { ProcessorDiagramProps, RegisterUpdates } from '@/Components/ProcessorDiagram/Types';
import type { LogEvent, Machine, MachineRegisters, MachineState } from '@/Machine/Types/Machine';

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

type RegisterBindings = Omit<MachineRegisters, 'BusA' | 'BusS'> & RegisterUpdates & Pick<ProcessorDiagramProps, 'mem' | 'onUpdateMem'>;

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

type MainInteractionBindings = {
  openChat: () => void;
  openSettings: () => void;
  updateRegisterFormat: NonNullable<ProcessorDiagramProps['onUpdateNumberFormat']>;
  setManualMode: (enabled: boolean) => void;
  updateDeviceInput: (value: number) => void;
  logProgramEvent: (event: LogEvent) => void;
  disableBreakpoints: () => void;
  clearBreakpoints: () => void;
};

/** Adapts view events to ordered writes and actions on the observable machine. */
export const createMainInteractionBindings = (machine: Machine, t: Machine['t']): MainInteractionBindings => ({
  openChat: () => {
    machine.aiChatOpen = true;
  },
  openSettings: () => {
    machine.settingsOpen = true;
  },
  updateRegisterFormat: ({ field, value }) => {
    machine.registerFormats[field] = value;
  },
  setManualMode: (enabled) => {
    if (enabled) {
      machine.manualModeCheck();
    } else {
      machine.manualModeUncheck();
    }
  },
  updateDeviceInput: (value) => {
    machine.DEV_IN = value;
    machine.DEV_READY = value ? 0 : 1;
  },
  logProgramEvent: (event) => {
    machine.addLog(event.message, event.class, event.error);
  },
  disableBreakpoints: () => {
    machine.breakpointsEnabled = false;
  },
  clearBreakpoints: () => {
    machine.breakpoints.clear();
    machine.addLog(t('logs.breakpointsCleared'), 'system');
  },
});
