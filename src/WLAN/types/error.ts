export type Severity = 'error' | 'warning' | 'info';

export interface DiagnosticLocation {
  line: number; // 1-based
  col: number; // 1-based, visual column
  length?: number; // length of the offending span (defaults to 1)
}

export interface DiagnosticData {
  code?: string;
  hint?: string;
  severity?: Severity;
  loc?: DiagnosticLocation;
  frame?: string;
}
