import type { Signal } from './Instructions';
export interface Token {
  col: number;
  line: number;
  text: string;
  type: string;
}

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

export interface RegisterOperand {
  type: 'Register';
  name: RegisterName;
  line: number;
}

export interface ImmediateOperand {
  type: 'Immediate';
  value: number;
  line: number;
}

export interface LabelRefOperand {
  type: 'LabelRef';
  name: string;
  line: number;
}

export type Operand = RegisterOperand | ImmediateOperand | LabelRefOperand;

export interface LabelDefinitionNode {
  type: 'LabelDefinition';
  name: string;
  line: number;
}

export interface DirectiveNode {
  type: 'Directive';
  name: string;
  operands: (ImmediateOperand | LabelRefOperand)[];
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
  condition: 'Z' | 'N' | string;
  thenBranch: Operand;
  elseBranch: Operand | null;
  line: number;
}

export type AstNode = LabelDefinitionNode | DirectiveNode | InstructionNode | ConditionalNode;

export interface ProgramAst {
  type: 'Program';
  body: AstNode[];
}

// ===== Microprogram Types =====
export type MicroPhase = Partial<Record<Signal, boolean>> & {
  conditional?: undefined | false;
  srcLine?: number;
};

export interface ConditionalPhase {
  srcLine?: number;
  __labels?: { t?: string; f?: string };
  __prefix?: Signal[];
  conditional: true;
  flag: string;
  truePhases: MicroPhase[];
  falsePhases: MicroPhase[];
}

export type Phase = MicroPhase | ConditionalPhase;

export interface MicroProgramEntry {
  srcLine?: number;
  pc: number;
  asmLine: string;
  phases: Phase[];
  meta?: {
    kind?: 'JUMP' | 'CJUMP' | 'NONE';
    flagName?: string;
    joinTarget?: number;
    trueTarget?: number;
    falseTarget?: number;
    flag?: 'Z' | 'N' | 'C' | 'V' | 'M';
    postAsm?: string[];
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
  flags: {
    Z: boolean;
    N: boolean;
    C?: boolean;
    V?: boolean;
    IE: boolean;
    IR: boolean;
  };
  mem: Uint8Array;
  dataStack: number[];
  callStack: { L: number; phaseIdx: number }[];
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
