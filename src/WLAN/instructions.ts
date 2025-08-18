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
  | 'readIO'
  | 'writeIO'
  | 'call'
  | 'ret'
  | 'pushAcc'
  | 'popAcc';

export type SignalSet = Partial<Record<Signal, true>>;

export interface ConditionalPhase {
  conditional: true;
  flag: 'Z' | 'M' | string;
  truePhases: SignalSet[];
  falsePhases: SignalSet[];
}

export type Phase = Signal[] | ConditionalPhase;

export type InstructionTemplates = Record<string, Phase[]>;

export const instructionTemplates: InstructionTemplates = {
  // skoki warunkowe
  SOZ: [
    ['czyt', 'wys', 'wei', 'il'],
    { conditional: true, flag: 'Z', truePhases: [{ wyad: true, wel: true, wea: true }], falsePhases: [{}] },
  ],
  SOM: [
    ['czyt', 'wys', 'wei', 'il'],
    { conditional: true, flag: 'M', truePhases: [{ wyad: true, wel: true, wea: true }], falsePhases: [{}] },
  ],

  // podstawowe ALU + load/store + skoki
  POB: [
    ['czyt', 'wys', 'wei', 'il'],
    ['wyad', 'wea'],
    ['czyt', 'wys', 'weja', 'weak', 'wyl', 'wea'],
  ],
  DOD: [
    ['czyt', 'wys', 'wei', 'il'],
    ['wyad', 'wea'],
    ['czyt', 'wys', 'weja', 'dod', 'weak', 'wyl', 'wea'],
  ],
  ODE: [
    ['czyt', 'wys', 'wei', 'il'],
    ['wyad', 'wea'],
    ['czyt', 'wys', 'weja', 'ode', 'weak', 'wyl', 'wea'],
  ],
  MNO: [
    ['czyt', 'wys', 'wei', 'il'],
    ['wyad', 'wea'],
    ['czyt', 'wys', 'weja', 'mno', 'weak', 'wyl', 'wea'],
  ],
  DZI: [
    ['czyt', 'wys', 'wei', 'il'],
    ['wyad', 'wea'],
    ['czyt', 'wys', 'weja', 'dziel', 'weak', 'wyl', 'wea'],
  ],
  LAD: [
    ['czyt', 'wys', 'wei', 'il'],
    ['weja', 'przep', 'weak', 'wyl', 'wea'],
  ],
  SOB: [
    ['czyt', 'wys', 'wei', 'il'],
    ['wyad', 'wel', 'wea'],
  ],
  STP: [['czyt', 'wys', 'wei', 'il']],

  // logiczne / przesunięcia / negacja
  PRZEP: [
    ['czyt', 'wys', 'wei', 'il'],
    ['wyad', 'wea'],
    ['czyt', 'wys', 'weja', 'przep', 'weak', 'wyl', 'wea'],
  ],
  ZAM: [
    ['czyt', 'wys', 'wei', 'il'],
    ['wyad', 'wea'],
    ['czyt', 'wys', 'weja', 'wea'],
  ],
  LUB: [
    ['czyt', 'wys', 'wei', 'il'],
    ['wyad', 'wea'],
    ['czyt', 'wys', 'weja', 'lub', 'weak', 'wyl', 'wea'],
  ],
  I: [
    ['czyt', 'wys', 'wei', 'il'],
    ['wyad', 'wea'],
    ['czyt', 'wys', 'weja', 'i', 'weak', 'wyl', 'wea'],
  ],
  AS: [
    ['czyt', 'wys', 'wei', 'il'],
    ['wyad', 'wea'],
    ['czyt', 'wys', 'weja', 'as', 'weak', 'wyl', 'wea'],
  ],
  SA: [
    ['czyt', 'wys', 'wei', 'il'],
    ['wyad', 'wea'],
    ['czyt', 'wys', 'weja', 'sa', 'weak', 'wyl', 'wea'],
  ],
  SHR: [
    ['czyt', 'wys', 'wei', 'il'],
    ['wyad', 'wea'],
    ['czyt', 'wys', 'weja', 'shr', 'weak', 'wyl', 'wea'],
  ],
  SHL: [
    ['czyt', 'wys', 'wei', 'il'],
    ['wyad', 'wea'],
    ['czyt', 'wys', 'weja', 'shl', 'weak', 'wyl', 'wea'],
  ],
  NEG: [
    ['czyt', 'wys', 'wei', 'il'],
    ['wyad', 'wea'],
    ['czyt', 'wys', 'weja', 'neg', 'weak', 'wyl', 'wea'],
  ],

  // I/O
  wpr: [
    ['czyt', 'wys', 'wei', 'il'],
    ['readIO', 'weja', 'weak', 'wyl', 'wea'],
  ],
  WYP: [
    ['czyt', 'wys', 'wei', 'il'],
    ['writeIO', 'wyl', 'wea'],
  ],

  // stos / podprogramy
  DNS: [['czyt', 'wys', 'wei', 'il'], ['pushAcc']],
  PZS: [['czyt', 'wys', 'wei', 'il'], ['popAcc']],
  SDP: [
    ['czyt', 'wys', 'wei', 'il'],
    ['wyad', 'call'],
  ],
  PWR: [['czyt', 'wys', 'wei', 'il'], ['ret']],
} as const;
