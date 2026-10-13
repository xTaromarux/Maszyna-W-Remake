export interface IRImmediateOperand {
  type: 'Immediate';
  value: number;
  line: number;
  col: number;
}

export interface IRInstruction {
  type: 'Instruction';
  name: string;
  line: number;
  address: number;
  operands: IRImmediateOperand[];
}

export interface IRMemoryDecl {
  type: 'MemoryDecl';
  name: 'RST' | 'RPA' | 'DATA';
  line: number;
  address: number;
  size: number;
  values: number[];
}

export interface IRDirective {
  type: 'Directive';
  name: 'ORG';
  line: number;
  value: number;
  addressBefore: number;
}

export interface IRLabel {
  name: string;
  line: number;
  address: number;
}

export interface IRInitAssignment {
  addr: number;
  val: number;
  source: 'data' | 'code';
  line: number;
}

export interface ProgramIR {
  type: 'ProgramIR';
  labels: IRLabel[];
  instructions: IRInstruction[];
  memoryDecls: IRMemoryDecl[];
  directives: IRDirective[];
  initAssignments: IRInitAssignment[];
}
