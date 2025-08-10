// Rich diagnostic error utilities for WLAN toolchain (lexer/parser/analyzer)

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

export function makeCodeFrame(
  source: string,
  lineOneBased: number,
  colOneBased: number,
  length: number = 1,
  contextLines: number = 2
): string {
  if (!source) return '';
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const lineIdx = Math.max(0, Math.min(lines.length - 1, lineOneBased - 1));
  const startCtx = Math.max(0, lineIdx - contextLines);
  const endCtx = Math.min(lines.length - 1, lineIdx + contextLines);

  const lineNoWidth = String(endCtx + 1).length;
  const frameLines: string[] = [];

  for (let i = startCtx; i <= endCtx; i++) {
    const gutter = String(i + 1).padStart(lineNoWidth, ' ');
    frameLines.push(`${gutter} | ${lines[i]}`);
    if (i === lineIdx) {
      const caretPos = Math.max(1, colOneBased);
      const underline = ' '.repeat(caretPos - 1) + '^' + (length > 1 ? '~'.repeat(Math.max(0, length - 1)) : '');
      frameLines.push(`${' '.repeat(lineNoWidth)} | ${underline}`);
    }
  }

  return frameLines.join('\n');
}

export class WlanError extends Error {
  code?: string;
  hint?: string;
  severity: Severity;
  loc?: DiagnosticLocation;
  frame?: string;

  constructor(message: string, options?: DiagnosticData & { source?: string }) {
    const composed = WlanError.composeMessage(message, options);
    super(composed);
    this.name = 'WlanError';
    this.code = options?.code;
    this.hint = options?.hint;
    this.severity = options?.severity || 'error';
    this.loc = options?.loc;
    this.frame = options?.frame;
    // Fix TS/JS inheritance
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static composeMessage(message: string, options?: DiagnosticData & { source?: string }): string {
    const parts: string[] = [];
    const code = options?.code ? `[${options.code}] ` : '';
    const where = options?.loc ? ` (linia ${options.loc.line}, kolumna ${options.loc.col})` : '';
    parts.push(`${code}${message}${where}`);

    const frame =
      options?.frame ||
      (options?.source && options.loc ? makeCodeFrame(options.source, options.loc.line, options.loc.col, options.loc.length || 1) : '');
    if (frame) parts.push('\n' + frame);
    if (options?.hint) parts.push(`\nPodpowiedź: ${options.hint}`);
    return parts.join('');
  }
}

export function errorFromToken(
  source: string,
  token: { line: number; col: number; text?: string },
  message: string,
  code?: string,
  hint?: string,
  length?: number
): WlanError {
  return new WlanError(message, {
    code,
    hint,
    loc: { line: token.line, col: token.col, length: length || (token.text ? token.text.length : 1) },
    source,
  });
}

export function errorAt(
  source: string,
  line: number,
  col: number,
  message: string,
  code?: string,
  hint?: string,
  length?: number
): WlanError {
  return new WlanError(message, { code, hint, loc: { line, col, length }, source });
}
