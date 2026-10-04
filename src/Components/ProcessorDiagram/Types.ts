import type { Update } from '../../Shared/Types/Common';
import type { Extras, MachineRegisters, RegisterField, RegisterFormatField, RegisterFormats, Signals } from '../../Machine/Types/Machine';
import type { NumberFormat } from '../../Shared/Types/Numbers';
import type { RuntimeCommand } from '../../Assembler/Types/Registry';
import type { CSSProperties, KeyboardEvent, MouseEvent } from 'react';

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

export interface BusLabelProps {
  busName: string;
  busValue: number;
  showInvisibleRegisters?: boolean;
  hideLabel?: boolean;
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

export interface AluSectionProps {
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
import type { FormatNumber } from '@/Shared/Types/Numbers';
