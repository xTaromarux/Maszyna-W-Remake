import type { NumberFormat } from '../../../Shared/Types/Numbers';
import type { Update } from '../../../Shared/Types/Common';
import type { Extras, Signals } from '../../../Machine/Types/Machine';
import type { FormatNumber } from '@/Shared/Types/Numbers';

export interface APRegisterSectionProps {
  visible?: boolean;
  AP: number;
  signals: Signals;
  numberFormat?: NumberFormat;
  onUpdateAP?: Update<number>;
  onUpdateNumberFormat?: Update<NumberFormat>;
  onClickItem?: Update<string>;
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

export interface RegisterISectionProps {
  I: number;
  signals: Signals;
  numberFormat?: NumberFormat;
  onUpdateI?: Update<number>;
  onUpdateNumberFormat?: Update<NumberFormat>;
  onClickItem?: Update<string>;
}
