import type { Token } from './Model';
import type { RuntimeCommand } from './Registry';

export interface ParseOptions {
  commandList: RuntimeCommand[];
}

export type UnresolvedOperand = { kind: 'Immediate'; value: number; token: Token } | { kind: 'Symbol'; name: string; token: Token };

export interface RawLine {
  line: number;
  labelTok?: Token;
  mnemonicTok?: Token;
  operands: UnresolvedOperand[];
}

export interface RawInstruction {
  nodeType: 'Instruction';
  line: number;
  address: number;
  name: string;
  mnemonicTok: Token;
  operands: UnresolvedOperand[];
}

export interface RawMemoryDecl {
  nodeType: 'MemoryDecl';
  line: number;
  address: number;
  name: 'RST' | 'RPA';
  mnemonicTok: Token;
  operands: UnresolvedOperand[];
}

export interface RawDataDirective {
  nodeType: 'DataDirective';
  line: number;
  address: number;
  name: 'DATA';
  mnemonicTok: Token;
  operands: UnresolvedOperand[];
}

export interface RawOrgDirective {
  nodeType: 'OrgDirective';
  line: number;
  addressBefore: number;
  name: 'ORG';
  mnemonicTok: Token;
  value: number;
  valueToken: Token;
}

export type RawNode = RawInstruction | RawMemoryDecl | RawDataDirective | RawOrgDirective;
