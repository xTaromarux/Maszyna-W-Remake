import type { CSSProperties, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import type { ColorData, ColorSelection, ColorUpdate } from './Colors';
import type { Action, ChildrenProps, DivProps, IconProps, NumberFormat, Update } from './Common';
import type { RuntimeCommand } from './Registry';
import type {
  CompiledPayload,
  Extras,
  ExtrasPatch,
  LocalizedLab,
  LogEntry,
  LogEvent,
  MachineRegisters,
  MemoryAssignment,
  RegisterField,
  RegisterFormatField,
  RegisterFormats,
  Signals,
  WsStatus,
} from './Simulator';

export type FormatNumber = (value: number) => string | number;
export interface Person {
  name?: string;
  baseName?: string;
  titles?: string[];
  roles?: string[];
  github?: string;
  linkedin?: string;
}
export type ToggleValue = string | boolean | number;
export type ToggleOption<T extends ToggleValue> = T | { value: T; label: ReactNode };
export interface SegmentedToggleProps<T extends ToggleValue> extends DivProps {
  valueKey?: 'value';
  labelKey?: 'label';
  options: ToggleOption<T>[];
  modelValue?: T | null;
  ariaLabel?: string;
  onUpdateModelValue?: Update<T>;
  onChange?: Update<T>;
  renderOption?: (option: ToggleOption<T>, index: number) => ReactNode;
}
export interface SettingsPanelProps {
  isAnimated?: boolean;
  isMobile?: boolean;
  lightMode: boolean;
  language?: string;
  numberFormat: NumberFormat;
  decSigned?: boolean;
  codeBits: number;
  addresBits: number;
  oddDelay: number;
  stepDelay: number;
  extras: Extras;
  platform?: string;
  autocompleteEnabled?: boolean;
  autoResetOnAsmCompile?: boolean;
  creators?: Person[];
  caregivers?: Person[];
  onClose?: Action;
  onUpdateExtras?: Update<ExtrasPatch>;
  onColorChange?: Update<ColorUpdate>;
  onUpdateLightMode?: Update<boolean>;
  onUpdateLanguage?: Update<string>;
  onUpdateNumberFormat?: Update<NumberFormat>;
  onUpdateDecSigned?: Update<boolean>;
  onUpdateCodeBits?: Update<number>;
  onUpdateAddresBits?: Update<number>;
  onUpdateOddDelay?: Update<number>;
  onUpdateStepDelay?: Update<number>;
  onUpdateAutocompleteEnabled?: Update<boolean>;
  onUpdateAutoResetOnAsmCompile?: Update<boolean>;
  onResetValues?: Action;
  onDefaultSettings?: Action;
  onOpenCommandList?: Action;
  onOpenLabDialog?: Action;
}
export interface SettingsOverlayProps extends SettingsPanelProps {
  settingsOpen?: boolean;
}
export type RegisterUpdates = { [K in RegisterField as `onUpdate${Capitalize<K>}`]?: Update<number> };
export interface ProcessorDiagramProps extends MachineRegisters, RegisterUpdates {
  mem: number[];
  manualMode: boolean;
  signals: Signals;
  registerFormats: RegisterFormats;
  extras: Extras;
  wordBits?: number;
  decSigned?: boolean;
  formatNumber: FormatNumber;
  decToCommand: (value: number) => RuntimeCommand | undefined;
  decToArgument: (value: number) => number;
  onClickItem?: Update<string>;
  onUpdateMem?: Update<number[]>;
  onUpdateNumberFormat?: Update<{ field: RegisterFormatField; value: NumberFormat }>;
}
export type SvgChildrenProps = ChildrenProps & Pick<IconProps, 'fill' | 'stroke'>;
export interface MemoryInputProps {
  value: number;
  min: number;
  max: number;
  label: string;
  onChange: (raw: string) => boolean;
}
export interface TextContentProps {
  text: string;
}
export interface CodeBlockProps {
  code: string;
  language: string;
}
export interface SwitchProps {
  label: string;
  checked?: boolean;
  onChange?: Update<boolean>;
}
export interface ActionIconProps {
  name: 'trash' | 'confirm' | 'cancel' | 'edit' | 'add' | 'load' | 'download';
}
export interface ColorPickerContentProps {
  title?: string;
  color: string;
  brightness: number;
  colorData?: ColorData;
  onClose?: Action;
  onApply?: Update<ColorSelection>;
}
export type ColorPickerPopupProps = Partial<Pick<ColorPickerContentProps, 'color' | 'brightness'>> &
  Omit<ColorPickerContentProps, 'color' | 'brightness'> & { visible?: boolean };

export interface AiChatProps {
  visible?: boolean;
  title?: string;
  placeholder?: string;
  instruction?: string;
  onClose?: Action;
}

export interface APRegisterSectionProps {
  visible?: boolean;
  AP: number;
  signals: Signals;
  numberFormat?: NumberFormat;
  onUpdateAP?: Update<number>;
  onUpdateNumberFormat?: Update<NumberFormat>;
  onClickItem?: Update<string>;
}

export interface BusLabelProps {
  busName: string;
  busValue: number;
  showInvisibleRegisters?: boolean;
  mobileView?: boolean;
  formatNumber: FormatNumber;
}

export interface BusSignalProps {
  signalStatus: boolean;
  mobileView?: boolean;
  busValue: number;
  showInvisibleRegisters?: boolean;
  busName: string;
  formatNumber: FormatNumber;
}

export interface CalcSectionProps {
  extras: Extras;
  signals: Signals;
  ACC: number;
  JAML: number;
  WS: number;
  decSigned?: boolean;
  wordBits?: number;
  accFormat?: NumberFormat;
  numberFormat?: NumberFormat;
  formatNumber: FormatNumber;
  onClickItem?: Update<string>;
  onUpdateACC?: Update<number>;
  onUpdateJAML?: Update<number>;
  onUpdateWS?: Update<number>;
  onUpdateAccFormat?: Update<NumberFormat>;
  onUpdateNumberFormat?: Update<NumberFormat>;
}

export interface CodeMirrorEditorProps extends DivProps {
  modelValue?: string;
  onUpdateModelValue?: Update<string>;
  onChange?: Update<string>;
  language?: 'macroW' | 'maszynaW' | 'javascript';
  theme?: 'macroTheme' | 'mwTheme';
  readOnly?: boolean;
  programCompiled?: boolean;
  disable?: boolean;
  onCompile?: Action;
  onEdit?: Action;
  autocompleteEnabled?: boolean;
  commandList?: RuntimeCommand[];
  maxHeight?: string;
  className?: string;
  style?: CSSProperties;
}

export interface CommandListProps extends DivProps {
  visible?: boolean;
  commandList?: RuntimeCommand[];
  codeBits?: number;
  onUpdateCommandList?: Update<RuntimeCommand[]>;
  onClose?: Action;
  className?: string;
}

export interface ConsoleProps extends DivProps {
  logs?: LogEntry[];
  onClose?: Action;
  onClear?: Action;
  className?: string;
}

export interface ConsoleExecutionControls {
  manualMode: boolean;
  codeCompiled: boolean;
  code?: string;
  isRunning: boolean;
  isFastRunning?: boolean;
  fastProgress?: number;
  onCompile?: Action;
  onEdit?: Action;
  onStep?: Action;
  onRun?: Action;
  onRunFast?: Action;
  onStop?: Action;
}

export interface ConsoleBreakpointControls {
  breakpointsEnabled?: boolean;
  onUpdateBreakpointsEnabled?: Update<boolean>;
  onDisableAllBreakpoints?: Action;
  onClearBreakpoints?: Action;
}

export interface ConsoleControlsProps {
  execution: ConsoleExecutionControls;
  breakpoints: ConsoleBreakpointControls;
}

export interface ConsoleDockProps extends DivProps, ConsoleControlsProps {
  logs?: LogEntry[];
  consoleOpen?: boolean;
  hasConsoleErrors?: boolean;
  onClose?: Action;
  onClear?: Action;
  onOpen?: Action;
  className?: string;
}

export interface CounterComponentProps {
  signals: Signals;
  programCounter: number;
  extras: Extras;
  numberFormat?: NumberFormat;
  onClickItem?: Update<string>;
  onUpdateProgramCounter?: Update<number>;
  onUpdateNumberFormat?: Update<NumberFormat>;
}

export interface GRegisterSectionProps {
  visible?: boolean;
  G: number;
  signals: Signals;
  numberFormat?: NumberFormat;
  onUpdateG?: Update<number>;
  onUpdateNumberFormat?: Update<NumberFormat>;
  onClickItem?: Update<string>;
}

export interface ProgramSectionProps extends DivProps {
  manualMode: boolean;
  commandList?: RuntimeCommand[];
  program?: string;
  autocompleteEnabled?: boolean;
  autoResetOnAsmCompile?: boolean;
  codeBits: number;
  addresBits: number;
  onUpdateCode?: Update<CompiledPayload>;
  onLog?: Update<LogEvent>;
  onInitMemory?: Update<MemoryAssignment[]>;
  onResetRegisters?: Action;
  className?: string;
}

export interface MemoryContentProps {
  A: number;
  S: number;
  mem: number[];
  signals: Signals;
  formatNumber: FormatNumber;
  decToCommand: (value: number) => RuntimeCommand | undefined;
  decToArgument: (value: number) => number;
  aFormat?: NumberFormat;
  sFormat?: NumberFormat;
  signedDec?: boolean;
  wordBits?: number;
  onUpdateA?: Update<number>;
  onUpdateS?: Update<number>;
  onUpdateMem?: Update<number[]>;
  onClickItem?: Update<string>;
  onUpdateAFormat?: Update<NumberFormat>;
  onUpdateSFormat?: Update<NumberFormat>;
}

export interface ExecutionControlsProps extends DivProps {
  manualMode: boolean;
  codeCompiled: boolean;
  code: string;
  isRunning: boolean;
  isFastRunning?: boolean;
  fastProgress?: number;
  onCompile?: Action;
  onEdit?: Action;
  onStep?: Action;
  onRun?: Action;
  onRunFast?: Action;
  onStop?: Action;
  className?: string;
}

export interface IOPanelProps extends DivProps {
  devIn?: number;
  devOut?: number;
  devReady?: number;
  wordBits: number;
  formatNumber: FormatNumber;
  onUpdateDevIn?: Update<number>;
  onUpdateDevReady?: Update<number>;
  className?: string;
}

export interface ProgramEditorProps extends DivProps {
  manualMode: boolean;
  codeCompiled: boolean;
  code?: string;
  compiledCode?: string[];
  activeLine: number;
  nextLine?: Set<string>;
  breakpoints?: Set<number>;
  breakpointsEnabled?: boolean;
  showIo?: boolean;
  devIn?: number;
  devOut?: number;
  devReady?: number;
  wordBits: number;
  formatNumber: FormatNumber;
  onUpdateCode?: Update<string>;
  onSetManualMode?: Update<boolean>;
  onUpdateDevIn?: Update<number>;
  onUpdateDevReady?: Update<number>;
  onToggleBreakpoint?: Update<number>;
  chooseProgram?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export interface MobileMemoryHeaderProps {
  signals: Signals;
  mobileView?: boolean;
  busAValue: number;
  busSValue: number;
  showInvisibleRegisters?: boolean;
  formatNumber: FormatNumber;
  onOpen?: Action;
  onClickItem?: Update<string>;
}

export interface RBRegisterSectionProps {
  visible?: boolean;
  RB: number;
  signals: Signals;
  numberFormat?: NumberFormat;
  onUpdateRB?: Update<number>;
  onUpdateNumberFormat?: Update<NumberFormat>;
  onClickItem?: Update<string>;
}

export interface RegisterComponentProps {
  label: string;
  id?: string;
  classNames?: string;
  model: number;
  numberFormat?: NumberFormat;
  signedDec?: boolean;
  wordBits?: number;
  showFormatSelector?: boolean;
  onUpdateModel?: Update<number>;
  onUpdateNumberFormat?: Update<NumberFormat>;
}

export interface RegisterISectionProps {
  I: number;
  signals: Signals;
  numberFormat?: NumberFormat;
  onUpdateI?: Update<number>;
  onUpdateNumberFormat?: Update<NumberFormat>;
  onClickItem?: Update<string>;
}

export interface RMRegisterSectionProps {
  visible?: boolean;
  RM: number;
  signals: Signals;
  numberFormat?: NumberFormat;
  onUpdateRM?: Update<number>;
  onUpdateNumberFormat?: Update<NumberFormat>;
  onClickItem?: Update<string>;
}

export interface RPRegisterSectionProps {
  visible?: boolean;
  RP: number;
  numberFormat?: NumberFormat;
  onUpdateRP?: Update<number>;
  onUpdateNumberFormat?: Update<NumberFormat>;
}

export interface RZRegisterSectionProps {
  visible?: boolean;
  RZ?: number;
  numberFormat?: NumberFormat;
  onUpdateRZ?: Update<number>;
  onUpdateNumberFormat?: Update<NumberFormat>;
}

export interface ColorPickerProps {
  modelValue?: string;
  size?: number;
  brightness?: number;
  onUpdateModelValue?: Update<string>;
  onUpdateBrightness?: Update<number>;
  onChange?: Update<ColorData>;
}

export interface CreatorsPanelProps {
  isMobile?: boolean;
  isAnimated?: boolean;
  creators?: Person[];
  caregivers?: Person[];
}

export interface LabCatalogDialogProps {
  visible?: boolean;
  labs?: LocalizedLab[];
  selectedLabId?: string;
  onClose?: Action;
  onSelectLab?: Update<string>;
  onLoadLab?: Action;
}

export interface PeopleSectionProps {
  title?: string;
  people?: Person[];
  showGithub?: boolean;
  columns?: number;
}

export interface SignalButtonProps {
  id: string;
  signal: boolean;
  label: string;
  divClassNames?: string;
  spanClassNames?: string;
  className?: string;
  onClick?: (event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => void;
  style?: CSSProperties;
}

export interface TopBarProps {
  hasConsoleErrors?: boolean;
  wsStatus?: WsStatus;
  platform?: string;
  onWsReconnect?: Action;
  onToggleConsole?: Action;
  onOpenChat?: Action;
  onOpenSettings?: Action;
}

export interface WSRegisterSectionProps {
  visible?: boolean;
  signals: Signals;
  WS: number;
  BusS?: number;
  extras: Extras;
  formatNumber: FormatNumber;
  numberFormat?: NumberFormat;
  onUpdateWS?: Update<number>;
  onUpdateNumberFormat?: Update<NumberFormat>;
  onClickItem?: Update<string>;
}

export interface XRegisterSectionProps {
  visible?: boolean;
  X: number;
  signals: Signals;
  numberFormat?: NumberFormat;
  onUpdateX?: Update<number>;
  onUpdateNumberFormat?: Update<NumberFormat>;
  onClickItem?: Update<string>;
}

export interface YRegisterSectionProps {
  visible?: boolean;
  Y: number;
  signals: Signals;
  numberFormat?: NumberFormat;
  onUpdateY?: Update<number>;
  onUpdateNumberFormat?: Update<NumberFormat>;
  onClickItem?: Update<string>;
}

export interface MemorySectionProps extends MemoryContentProps {
  mobileView?: boolean;
  busAValue: number;
  busSValue: number;
  showInvisibleRegisters?: boolean;
}

export type SettingsNumber = readonly [
  key: 'codeBits' | 'addresBits' | 'oddDelay' | 'stepDelay',
  id: string,
  label: string,
  help: string,
  min: number,
  max: number,
];
export type PendingColor = ColorSelection & Pick<ColorUpdate, 'type'>;
