import type { NumberFormat } from '../../Shared/Types/Numbers';
import type { DiagnosticData } from '../../Shared/Errors/Diagnostics';
import type { BaseErrorData } from '../../Shared/Errors/Types';
import type { ConditionalPhase, MicroPhase, MicroProgramEntry, RuntimePhase } from '../../Assembler/Types/Model';
import type { Action, Timer, Translator } from '../../Shared/Types/Common';
import type { Lab, LocalizedLab } from './Labs';
import type { RuntimeCommand } from '../../Assembler/Types/Registry';
import type { ColorUpdate } from './EspColors';

export type RegisterField =
  | 'programCounter'
  | 'I'
  | 'ACC'
  | 'JAML'
  | 'A'
  | 'S'
  | 'X'
  | 'Y'
  | 'RB'
  | 'G'
  | 'RZ'
  | 'RP'
  | 'RM'
  | 'AP'
  | 'WS'
  | 'BusA'
  | 'BusS';

export type RegisterFormatField = Exclude<RegisterField, 'programCounter'> | 'L';

export type MachineRegisters = Record<RegisterField, number>;

export type RegisterFormats = Record<RegisterFormatField, NumberFormat>;

export type Signals = Record<string, boolean>;

export interface Extras {
  xRegister: boolean;
  yRegister: boolean;
  io: { rbRegister: boolean; gRegister: boolean };
  stack: { wsRegister: boolean; wylsSignal: boolean };
  interrupts: {
    rzRegister: boolean;
    rpRegister: boolean;
    rmRegister: boolean;
    apRegister: boolean;
    rintSignal: boolean;
    eniSignal: boolean;
  };
  dl: boolean;
  jamlExtras: boolean;
  busConnectors: boolean;
  showInvisibleRegisters: boolean;
}

export type ExtrasPatch = { [K in keyof Extras]?: Extras[K] extends object ? Partial<Extras[K]> : Extras[K] };

export type WsStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export type StackKind = 'Data' | 'Address';

export interface StackEntry {
  type: StackKind;
  value: number;
}

export type LogError = Partial<BaseErrorData> & DiagnosticData;

export interface LogEntry {
  id: string;
  level?: BaseErrorData['level'];
  message: string;
  class: string;
  timestamp: Date | string;
  error?: LogError;
}

export interface LogEvent {
  message: string;
  class: string;
  error?: LogError;
}

export interface MemoryAssignment {
  addr: number;
  val: number;
}

export interface CompiledPayload {
  text: string;
  program: MicroProgramEntry[];
}

export interface ConditionalExecution {
  stage?: 'SHOW_IF' | 'BRANCH';
  list: MicroPhase[];
  idx: number;
  pick: 'T' | 'F';
  phaseRef: ConditionalPhase;
}

export interface ToastOptions {
  type?: string;
  duration?: number;
}

export interface ResetOptions {
  resetMemory?: boolean;
  resetLogs?: boolean;
  logMessage?: string;
}

export interface MachineServices {
  showToast(message: string, options?: ToastOptions): void;
  getMaxValueForRegister(registerType: string): number;
}

export interface MachineStore {
  machine: Machine;
  subscribe(listener: Action): Action;
  getSnapshot(): number;
  start(): void;
  dispose(): void;
}

export interface MachineSelectors {
  readonly anyPopupOpen: boolean;
  readonly globalBackdropOpen: boolean;
  readonly localizedLabCatalog: LocalizedLab[];
  readonly selectedLab: Lab | null;
  readonly rint: boolean;
  readonly highestPriorityIRQ: number | null;
}

export type SelectorMethods = { [K in keyof MachineSelectors]: () => MachineSelectors[K] };

export type Machine = MachineState &
  MachineActions &
  MicroActions &
  MachineSelectors & {
    t: Translator;
    saveToLS(): void;
    loadFromLS(): void;
  };

export interface MachineState extends MachineRegisters {
  _skipNextBreakpoint: boolean;
  breakpointsEnabled: boolean;
  breakpoints: Set<number>;
  _headless: boolean;
  isFastRunning: boolean;
  fastProgress: number;
  _lastLogKey: string | null;
  _lastLogCount: number;
  _lastLogTs: number;
  platform: string;
  ws: WebSocket | null;
  wsStatus: WsStatus;
  wsPingTimer: Timer | null;
  decSigned: boolean;
  _condState: ConditionalExecution | null;
  _pendingStackWrite: { address: number; type: StackKind } | null;
  _pendingStackRead: number | null;
  autocompleteEnabled: boolean;
  autoResetOnAsmCompile: boolean;
  isMobile: boolean;
  suppressBroadcast: boolean;
  prevSignals: Signals;
  prevMem: number[];
  addresBits: number;
  codeBits: number;
  mem: number[];
  DEV_READY: number;
  DEV_IN: number;
  DEV_OUT: number;
  DEV_BUSY: boolean;
  deviceOperationTimer: Timer | null;
  runLoopTimer: Timer | null;
  isRunning: boolean;
  stack: StackEntry[];
  code: string;
  program: string;
  compiledCode: string[];
  compiledProgram: MicroProgramEntry[];
  activeInstrIndex: number;
  activePhaseIndex: number;
  activeLine: number;
  nextLine: Set<string>;
  _stepGuard: number;
  activeTimeouts: Timer[];
  oddDelay: number;
  stepDelay: number;
  isAutoStepping: boolean;
  autoStepInterval: Timer | null;
  busHoldMs: number;
  _busHoldTimers: { A: Timer | null; S: Timer | null };
  commandList: RuntimeCommand[];
  numberFormat: NumberFormat;
  registerFormats: RegisterFormats;
  signals: Signals;
  extras: Extras;
  logs: LogEntry[];
  manualMode: boolean;
  codeCompiled: boolean;
  disappearBlour: boolean;
  blurHideTimer: Timer | null;
  settingsOpen: boolean;
  commandListOpen: boolean;
  aiChatOpen: boolean;
  labDialogOpen: boolean;
  selectedLabId: string;
  labCatalog: Lab[];
  toast: { visible: boolean; message: string; type: string };
  toastTimer: Timer | null;
  lightMode: boolean;
  language: string;
  consoleOpen: boolean;
  hasConsoleErrors: boolean;
  reconnectTimer?: Timer | null;
  errorTimeoutId?: Timer | null;
  errorMessage?: string;
  _runGeneration?: number;
  _runningDocumentTitle?: string | null;
}

export interface MachineActions {
  showToast(message: string, options?: ToastOptions): void;
  getMaxValueForRegister(registerType: string): number;
  toggleBreakpoint(lineIdx: number): void;
  _shouldPauseOnBreakpoint(nextSrcLine: number): boolean;
  reconnectWS(): void;
  holdBus(which: 'A' | 'S'): void;
  getDefaultExtras(): Extras;
  mergeExtras(current: Extras | null, patch: ExtrasPatch | null): Extras;
  to8(v: number): number;
  toWord(v: number): number;
  wordMask(): number;
  addrMask(): number;
  stackPush(type: StackKind, value: number): void;
  stackPop(expectedType: StackKind): number;
  handleProgramSectionCompile(payload: string | CompiledPayload): void;
  handleAsmAutoReset(): void;
  applyInitMemory(assignments: MemoryAssignment[]): void;
  initWebsocket(): void;
  handleRemoteToggleLocalWebSocket(id: string, value: boolean): void;
  handleRemoteToggleESPWebSocket(value: string): void;
  checkConflict(signalName: string): string | null;
  handleSignalToggle(signalName: string): void;
  sendSignalToESP(signalName: string, state: boolean): void;
  sendPartialData(fieldName: string, newValue: number | boolean): void;
  sendMemUpdate(): void;
  sendFullDataToESP(): void;
  sendColorToESP(colorData: ColorUpdate): void;
  handleRemoteMemUpdate(idx: number, value: number): void;
  syncDocumentLanguage(lang?: string): void;
  addLog(message: string, classification?: string, errorObj?: LogError | null): void;
  translateLogMessage(message: unknown): string;
  formatNumber(number: number): string | number;
  decToCommand(dec: number): RuntimeCommand | undefined;
  decToArgument(dec: number): number;
  resizeMemory(): void;
  manualModeCheck(): void;
  manualModeUncheck(): void;
  manualModeChanged(): void;
  closePopups(popupName: 'settingsOpen' | 'commandListOpen' | 'aiChatOpen'): void;
  openLabDialog(): void;
  closeLabDialog(): void;
  selectLab(labId: string): void;
  loadSelectedLab(): void;
  compileCode(): void;
  uncompileCode(): void;
  handleInterrupt(): void;
  executeLine(): void;
  _refreshHighlight(): void;
  getResolvedPhase(phase: RuntimePhase | null | undefined): MicroPhase;
  evaluateFlag(flag: string): boolean;
  stopRun(): void;
  runCode(): void;
  _stopRun(): void;
  runToEndFast(): Promise<void>;
  resetValues(options?: ResetOptions): void;
  restoreDefaults(): void;
  openCommandList(): void;
  toggleConsole(): void;
  closeConsole(): void;
  clearConsole(): void;
  handleKeyPress(event: KeyboardEvent): void;
  clearActiveTimeouts(): void;
  testEnhancedConsole(): void;
}

export interface MicroActions {
  executeSignalsFromNextLine(): void;
  cancelDeviceOperation(): void;
  il(): void;
  dl(): void;
  wyl(): void;
  wel(): void;
  wyad(): void;
  wei(): void;
  iak(): void;
  dak(): void;
  weak(): void;
  weja(): void;
  wyak(): void;
  dod(): void;
  ode(): void;
  przep(): void;
  mno(): void;
  dziel(): void;
  shr(): void;
  shl(): void;
  neg(): void;
  lub(): void;
  i(): void;
  wyx(): void;
  wex(): void;
  wyy(): void;
  wey(): void;
  wea(): void;
  wes(): void;
  wys(): void;
  stop(): void;
  as(): void;
  sa(): void;
  czyt(): void;
  pisz(): void;
  wyws(): void;
  iws(): void;
  dws(): void;
  wyls(): void;
  wyg(): void;
  werb(): void;
  wyrb(): void;
  start(): void;
  werm(): void;
  wyrm(): void;
  wyap(): void;
  weap(): void;
  wyrz(): void;
  werz(): void;
  wyrp(): void;
  werp(): void;
  ustrm(): void;
  czrm(): void;
}
