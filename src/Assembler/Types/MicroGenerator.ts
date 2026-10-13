export interface MicroOperationToken {
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

export interface ConditionalLines {
  prefixLines: string[];
  conditionalLineIndex: number;
}
export interface ConditionalBuild {
  meta?: CJumpMeta;
  phases?: MicroOperationToken[];
  condPhase?: import('./Model').RuntimePhase;
}
