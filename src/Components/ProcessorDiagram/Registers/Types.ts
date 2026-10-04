import type { NumberFormat } from '../../../Shared/Types/Numbers';
import type { Update } from '../../../Shared/Types/Common';
import type { Extras, Signals } from '../../../Machine/Types/Machine';
import type { FormatNumber } from '@/Shared/Types/Numbers';

/** Shared display and interaction fields of the six optional signal registers. */
interface SignalRegisterSectionProps {
  visible?: boolean;
  signals: Signals;
  numberFormat?: NumberFormat;
  onUpdateNumberFormat?: Update<NumberFormat>;
  onClickItem?: Update<string>;
}

export interface APRegisterSectionProps extends SignalRegisterSectionProps {
  AP: number;
  onUpdateAP?: Update<number>;
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

export interface GRegisterSectionProps extends SignalRegisterSectionProps {
  G: number;
  onUpdateG?: Update<number>;
}

export interface RBRegisterSectionProps extends SignalRegisterSectionProps {
  RB: number;
  onUpdateRB?: Update<number>;
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

export interface RMRegisterSectionProps extends SignalRegisterSectionProps {
  RM: number;
  onUpdateRM?: Update<number>;
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

export interface XRegisterSectionProps extends SignalRegisterSectionProps {
  X: number;
  onUpdateX?: Update<number>;
}

export interface YRegisterSectionProps extends SignalRegisterSectionProps {
  Y: number;
  onUpdateY?: Update<number>;
}

export interface RegisterISectionProps {
  I: number;
  signals: Signals;
  numberFormat?: NumberFormat;
  onUpdateI?: Update<number>;
  onUpdateNumberFormat?: Update<NumberFormat>;
  onClickItem?: Update<string>;
}
