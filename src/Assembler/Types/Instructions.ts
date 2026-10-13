export type Signal =
  | 'czyt'
  | 'wys'
  | 'wei'
  | 'il'
  | 'wyad'
  | 'wea'
  | 'wyl'
  | 'wel'
  | 'weja'
  | 'weak'
  | 'przep'
  | 'dod'
  | 'ode'
  | 'mno'
  | 'dziel'
  | 'shr'
  | 'shl'
  | 'neg'
  | 'lub'
  | 'i'
  | 'as'
  | 'sa'
  | 'pisz'
  | 'readIO'
  | 'writeIO'
  | 'call'
  | 'ret'
  | 'pushAcc'
  | 'popAcc'
  | 'wyws'
  | 'iws'
  | 'dws'
  | 'wyls'
  | 'wyg'
  | 'werb'
  | 'wyrb'
  | 'start'
  | 'ustrm'
  | 'czrm'
  | 'werm'
  | 'wyrm'
  | 'werz'
  | 'wyrz'
  | 'werp'
  | 'wyrp'
  | 'weap'
  | 'wyap'
  | 'dl'
  | 'wes'
  | 'wyak'
  | 'busA'
  | 'busS'
  | 'iak'
  | 'dak'
  | 'wyx'
  | 'wex'
  | 'wyy'
  | 'wey'
  | 'stop'
  | 'wews'
  | 'rint';

export type SignalSet = Partial<Record<Signal, true>>;

export interface ConditionalPhase {
  __labels?: { t?: string; f?: string };
  __prefix?: Signal[];
  conditional: true;
  flag: 'Z' | 'N' | 'M' | string;
  truePhases: SignalSet[];
  falsePhases: SignalSet[];
}

export type TemplatePhase = Signal[] | ConditionalPhase;
export type InstructionTemplates = Record<string, TemplatePhase[]>;
