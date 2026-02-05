export interface Phase {
  [k: string]: any;
  op: string;
}

export interface CJumpMeta {
  kind: 'CJUMP';
  flagName: 'Z' | 'N' | 'C' | 'V' | 'M';
  trueTarget?: number;
  falseTarget?: number;
  joinTarget?: number;
  _branchLocked?: boolean;
  srcLine?: number;
}
