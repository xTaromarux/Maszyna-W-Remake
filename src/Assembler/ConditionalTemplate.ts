import type { ConditionalLines, ConditionalBuild, CJumpMeta, Phase } from './Types/MicroGenerator';
import type { Signal, SignalSet } from './Types/Instructions';
import type { MicroPhase, Phase as RuntimePhase } from './Types/Model';

const CONDITIONAL_LINE_RE = /^\s*IF\s+([A-Z])\s+THEN\s+@([\p{L}\w]+)\s+ELSE\s+@([\p{L}\w]+)\s*;?\s*$/u;

const normalizeConditionalFlag = (flag: string): string => (flag === 'M' ? 'N' : flag);

const toMicroPhaseFromSignalSet = (signalSet: SignalSet): MicroPhase => {
  const microPhase: MicroPhase = {};
  for (const signalName in signalSet) {
    if (signalSet[signalName as Signal]) {
      microPhase[signalName as Signal] = true;
    }
  }
  return microPhase;
};

const trimAtEndMarker = (phases: Phase[]): Phase[] => {
  const endIndex = phases.findIndex((phase) => phase.op === 'END' || phase.op === 'END_BRANCH');
  return endIndex >= 0 ? phases.slice(0, endIndex) : phases;
};

const collectLabelBodyLines = (lines: string[], labelName: string): string[] => {
  const labelStartIndex = lines.findIndex((line) => new RegExp(`^\\s*@${labelName}\\b`, 'u').test(line));
  if (labelStartIndex === -1) {
    return [];
  }

  const bodyLines: string[] = [];
  for (let i = labelStartIndex + 1; i < lines.length; i++) {
    if (/^\s*@[\p{L}\w]+/u.test(lines[i])) {
      break;
    }
    bodyLines.push(lines[i]);
  }

  return bodyLines;
};

const tokenizeLineToOps = (line: string): Phase[] =>
  line
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => ({ op: token }));

const flattenLinesToOps = (lines: string[]): Phase[] => {
  const phases: Phase[] = [];
  for (const line of lines) {
    phases.push(...tokenizeLineToOps(line));
  }
  return phases;
};

const splitLinesBeforeConditional = (lines: string[]): ConditionalLines => {
  const conditionalLineIndex = lines.findIndex((line) => CONDITIONAL_LINE_RE.test(line));
  if (conditionalLineIndex === -1) {
    return { prefixLines: lines.slice(), conditionalLineIndex: -1 };
  }
  return { prefixLines: lines.slice(0, conditionalLineIndex), conditionalLineIndex };
};

const opsToSingleBranchPhases = (ops: Phase[]): MicroPhase[] => {
  if (!ops.length) {
    return [];
  }

  const signalSet: SignalSet = {};
  for (const op of ops) {
    const signalName = op.op?.toLowerCase();
    if (signalName && signalName !== 'koniec' && signalName !== 'end_branch') {
      signalSet[signalName as Signal] = true;
    }
  }

  return Object.keys(signalSet).length ? [toMicroPhaseFromSignalSet(signalSet)] : [];
};

/** Parses the newline-based fallback grammar independently from semicolon command chunks. */
export const buildConditionalForInstr = (lines: string[]): ConditionalBuild => {
  const { prefixLines, conditionalLineIndex } = splitLinesBeforeConditional(lines);
  if (conditionalLineIndex === -1) {
    return {};
  }

  const conditionalLine = lines[conditionalLineIndex];
  const match = conditionalLine.match(CONDITIONAL_LINE_RE);
  if (!match) {
    return {};
  }

  const flagName = (match[1] as CJumpMeta['flagName']) || 'Z';
  const trueLabel = match[2];
  const falseLabel = match[3];

  const trueBranchLines = collectLabelBodyLines(lines, trueLabel);
  const falseBranchLines = collectLabelBodyLines(lines, falseLabel);

  const trueBranchOps = trimAtEndMarker(flattenLinesToOps(trueBranchLines));
  const falseBranchOps = trimAtEndMarker(flattenLinesToOps(falseBranchLines));

  const condPhase: RuntimePhase = {
    conditional: true,
    flag: normalizeConditionalFlag(flagName),
    truePhases: opsToSingleBranchPhases(trueBranchOps),
    falsePhases: opsToSingleBranchPhases(falseBranchOps),
  };

  return {
    meta: { kind: 'CJUMP', flagName },
    phases: flattenLinesToOps(prefixLines),
    condPhase,
  };
};
