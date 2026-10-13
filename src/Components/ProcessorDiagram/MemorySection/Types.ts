import type { NumberFormat } from '../../../Shared/Types/Numbers';
import type { Action, Update } from '../../../Shared/Types/Common';
import type { RuntimeCommand } from '../../../Assembler/Types/Registry';
import type { Signals } from '../../../Machine/Types/Machine';
import type { FormatNumber } from '@/Shared/Types/Numbers';

export interface MemoryInputProps {
  value: number;
  min: number;
  max: number;
  label: string;
  onChange: (raw: string) => boolean;
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

export interface MemorySectionProps extends MemoryContentProps {
  mobileView?: boolean;
  busAValue: number;
  busSValue: number;
  showInvisibleRegisters?: boolean;
}
