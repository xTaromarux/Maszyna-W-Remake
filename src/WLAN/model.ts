export type Token = {
  col: number;
  line: number;
  text: string;
  type: string;
};

export enum TokenType {
  IDENT = 'IDENT',
  COLON = 'COLON',
  NEWLINE = 'NEWLINE',
  SEMICOLON = 'SEMICOLON',
  NUMBER = 'NUMBER',
  AT = 'AT',
  COMMA = 'COMMA',
}

// ===== AST Types =====
export type RegisterName = 'A' | 'S' | 'L' | 'I' | 'AK' | 'PC' | 'IR';

export type RegisterOperand = { type: 'Register'; name: RegisterName; line: number };
export type ImmediateOperand = { type: 'Immediate'; value: number; line: number };
export type LabelRefOperand = { type: 'LabelRef'; name: string; line: number };
export type Operand = RegisterOperand | ImmediateOperand | LabelRefOperand;

export interface LabelDefinitionNode {
  type: 'LabelDefinition';
  name: string;
  line: number;
}

export interface DirectiveNode {
  type: 'Directive';
  name: string;
  operands: Array<ImmediateOperand | LabelRefOperand>;
  line: number;
  _initMemory?: { addr: number; val: number };
}

export interface InstructionNode {
  type: 'Instruction';
  name: string;
  operands: Operand[];
  line: number;
}

export interface ConditionalNode {
  type: 'Conditional';
  condition: 'Z' | 'N' | string; // Flaga warunku (Z=zero, N=negative)
  thenBranch: Operand; // Etykieta do skoku gdy warunek spełniony
  elseBranch: Operand | null; // Etykieta do skoku gdy warunek nie spełniony (opcjonalne)
  line: number;
}

export type AstNode = LabelDefinitionNode | DirectiveNode | InstructionNode | ConditionalNode;

export interface ProgramAst {
  type: 'Program';
  body: AstNode[];
}

// ===== Microprogram Types =====
export type MicroSignalName =
  | 'il'
  | 'dl'
  | 'wyl'
  | 'wel'
  | 'wyad'
  | 'wea'
  | 'wei'
  | 'wys'
  | 'wes'
  | 'czyt'
  | 'pisz'
  | 'as'
  | 'sa'
  | 'weja'
  | 'weak'
  | 'dod'
  | 'ode'
  | 'mno'
  | 'dziel'
  | 'shr'
  | 'shl'
  | 'neg'
  | 'lub'
  | 'i'
  | 'readIO'
  | 'writeIO'
  | 'wyak'
  | 'pushAcc'
  | 'popAcc'
  | 'call'
  | 'ret';

export type MicroPhase = Partial<Record<MicroSignalName, boolean>> & { conditional?: undefined | boolean };

export interface ConditionalPhase {
  conditional: true;
  flag: 'Z' | 'N' | string;
  truePhases: MicroPhase[];
  falsePhases: MicroPhase[];
}

export type Phase = MicroPhase | ConditionalPhase;

export interface MicroProgramEntry {
  pc: number; // indeks instrukcji
  asmLine: string;
  phases: Phase[];
  meta?: {
    kind?: 'JUMP' | 'CJUMP' | 'NONE';
    trueTarget?: number; // indeks instrukcji (dla SOB/SOZ/SOM)
    falseTarget?: number; // zwykle pc+1
    flag?: 'Z' | 'N'; // dla SOZ/SOM
  };
}

// ===== Store Type for Simulator/Debugger =====
export interface Store {
  I: number;
  L: number;
  A: number;
  S: number;
  Ak: number;
  magA: number;
  magS: number;
  flags: { Z: boolean; N: boolean; IE: boolean; IR: boolean };
  mem: Uint8Array;
  dataStack: number[];
  callStack: Array<{ L: number; phaseIdx: number }>;
  program: MicroProgramEntry[];
  phaseIdx: number;
  ioIn: number[];
  ioOut: number[];
  portIn: number;
  portOut: number;
  vectorBase: number;
  _aluIn?: number;
  _aluOut?: number;
}
