import type { MicroProgramEntry, RuntimePhase } from '@/Assembler/Types/Model';
import type { Machine } from './Types/Machine';

const shouldPauseOn = (machine: Machine, line: number | undefined) => {
  if (machine._skipNextBreakpoint) {
    machine._skipNextBreakpoint = false;
    return false;
  }
  return (
    machine.isRunning &&
    machine.breakpointsEnabled &&
    typeof line === 'number' &&
    Number.isFinite(line) &&
    machine.breakpoints &&
    typeof machine.breakpoints.has === 'function' &&
    machine.breakpoints.has(line)
  );
};

/** Executes one structured phase, retaining its branch cursor and breakpoint semantics. */
export const executeStructuredStep = (machine: Machine) => {
  const setHighlight = (node?: RuntimePhase | MicroProgramEntry) => {
    if (machine._headless) {
      return;
    }
    if (node && typeof node.srcLine === 'number' && typeof node.srcLine === 'number' && Number.isFinite(node.srcLine)) {
      machine.activeLine = node.srcLine;
      return;
    }
    machine._refreshHighlight();
  };

  const stopAtBreakpoint = (line: number | undefined) => {
    if (!shouldPauseOn(machine, line)) {
      return false;
    }
    if (typeof line === 'number' && Number.isFinite(line)) {
      machine.activeLine = line;
    }
    machine.addLog(machine.t('logs.breakpointPause', { line }), 'system');
    machine._stopRun();
    return true;
  };

  const finishStructuredProgram = () => {
    machine.uncompileCode();
    machine.addLog(machine.t('logs.codeFinished'), 'compiler');
  };

  const moveToNextPhase = () => {
    machine.activePhaseIndex += 1;
    const instruction = machine.compiledProgram[machine.activeInstrIndex];
    if (machine.activePhaseIndex >= (instruction?.phases?.length || 0)) {
      // Legacy assembler templates keep STOP after the instruction's phases in metadata.
      if (instruction?.meta?.postAsm?.includes('stop')) {
        machine.uncompileCode();
        machine.addLog(machine.t('logs.stopInstr'), 'compiler');
        return;
      }

      machine.activeInstrIndex += 1;
      machine.activePhaseIndex = 0;
    }
  };

  const jumpToProgramCounter = () => {
    const target = machine.programCounter;
    if (target >= 0 && target < machine.compiledProgram.length) {
      machine.activeInstrIndex = target;
      machine.activePhaseIndex = 0;
      machine._condState = null;
      const nextInstruction = machine.compiledProgram[machine.activeInstrIndex];
      const nextPhase = nextInstruction?.phases?.[machine.activePhaseIndex];
      setHighlight(nextPhase ?? nextInstruction);
      return true;
    }

    machine.addLog(machine.t('logs.jumpOob', { target }), 'error');
    machine.uncompileCode();
    return false;
  };

  const executeMicroPhase = (phase: RuntimePhase) => {
    const signals = new Set(Object.keys(phase || {}).filter((key) => Reflect.get(phase, key) === true));
    machine.nextLine = signals;
    machine.executeSignalsFromNextLine();
  };

  if (machine.activeInstrIndex < 0) {
    machine.activeInstrIndex = 0;
    machine.activePhaseIndex = 0;
    machine._stepGuard = 0;
    machine._condState = null;
  }

  if (machine.activePhaseIndex === 0 && machine.extras?.interrupts?.eniSignal && machine.rint) {
    machine.handleInterrupt();
    return;
  }

  machine._stepGuard = (machine._stepGuard || 0) + 1;
  if (machine._stepGuard > 100000) {
    machine.addLog(machine.t('logs.loopGuard'), 'system');
    machine.uncompileCode();
    return;
  }

  if (machine.activeInstrIndex >= machine.compiledProgram.length) {
    finishStructuredProgram();
    return;
  }

  const instruction = machine.compiledProgram[machine.activeInstrIndex];
  const currentPhase = instruction?.phases?.[machine.activePhaseIndex];

  if (!currentPhase) {
    moveToNextPhase();
    if (!machine.codeCompiled) {
      return;
    }
    if (machine.activeInstrIndex >= machine.compiledProgram.length) {
      finishStructuredProgram();
      return;
    }
    const nextInstruction = machine.compiledProgram[machine.activeInstrIndex];
    const nextPhase = nextInstruction?.phases?.[machine.activePhaseIndex];
    setHighlight(nextPhase ?? nextInstruction);
    return;
  }

  let phaseToExecute = currentPhase;
  let sourceLine =
    typeof phaseToExecute?.srcLine === 'number' && Number.isFinite(phaseToExecute?.srcLine) ? phaseToExecute.srcLine : undefined;
  let executingConditionalBranch = false;

  if (currentPhase.conditional === true) {
    executingConditionalBranch = true;

    if (!machine._condState || machine._condState.phaseRef !== currentPhase) {
      const cond = machine.evaluateFlag(currentPhase.flag);
      const list = (cond ? currentPhase.truePhases : currentPhase.falsePhases) || [];
      machine._condState = {
        list,
        idx: 0,
        pick: cond ? 'T' : 'F',
        phaseRef: currentPhase,
      };

      const ifLine = typeof currentPhase.srcLine === 'number' && Number.isFinite(currentPhase.srcLine) ? currentPhase.srcLine : undefined;
      if (stopAtBreakpoint(ifLine)) {
        return;
      }
    }

    const state = machine._condState;
    const branchPhase = state?.list?.[state.idx];
    if (!branchPhase) {
      machine._condState = null;
      moveToNextPhase();
      if (!machine.codeCompiled) {
        return;
      }
      if (machine.activeInstrIndex >= machine.compiledProgram.length) {
        finishStructuredProgram();
        return;
      }
      const nextInstruction = machine.compiledProgram[machine.activeInstrIndex];
      const nextPhase = nextInstruction?.phases?.[machine.activePhaseIndex];
      setHighlight(nextPhase ?? nextInstruction);
      return;
    }

    phaseToExecute = branchPhase;
    const fallbackLine =
      typeof state?.phaseRef?.srcLine === 'number' && Number.isFinite(state?.phaseRef?.srcLine)
        ? state.phaseRef.srcLine + (state.pick === 'T' ? 1 : 2)
        : undefined;
    sourceLine = typeof branchPhase?.srcLine === 'number' && Number.isFinite(branchPhase?.srcLine) ? branchPhase.srcLine : fallbackLine;
  } else {
    machine._condState = null;
  }

  if (phaseToExecute.conditional !== true && phaseToExecute.stop === true) {
    setHighlight(phaseToExecute);
    machine.uncompileCode();
    machine.addLog(machine.t('logs.stopInstr'), 'compiler');
    return;
  }

  if (stopAtBreakpoint(sourceLine)) {
    return;
  }

  setHighlight(phaseToExecute);
  executeMicroPhase(phaseToExecute);

  if (phaseToExecute.conditional !== true && phaseToExecute.wel === true) {
    jumpToProgramCounter();
    return;
  }

  if (executingConditionalBranch && machine._condState) {
    machine._condState.idx += 1;
    if (machine._condState.idx < machine._condState.list.length) {
      const nextBranchPhase = machine._condState.list[machine._condState.idx];
      const fallbackLine =
        typeof machine._condState.phaseRef?.srcLine === 'number' && Number.isFinite(machine._condState.phaseRef?.srcLine)
          ? machine._condState.phaseRef.srcLine + (machine._condState.pick === 'T' ? 1 : 2)
          : undefined;
      const nextLine =
        typeof nextBranchPhase?.srcLine === 'number' && Number.isFinite(nextBranchPhase?.srcLine) ? nextBranchPhase.srcLine : fallbackLine;
      if (!machine._headless && typeof nextLine === 'number' && Number.isFinite(nextLine)) {
        machine.activeLine = nextLine;
      }
      return;
    }
    machine._condState = null;
  }

  moveToNextPhase();
  if (!machine.codeCompiled) {
    return;
  }
  if (machine.activeInstrIndex >= machine.compiledProgram.length) {
    finishStructuredProgram();
    return;
  }

  const nextInstruction = machine.compiledProgram[machine.activeInstrIndex];
  const nextPhase = nextInstruction?.phases?.[machine.activePhaseIndex];
  setHighlight(nextPhase ?? nextInstruction);
  return;
};

/** Executes one plain microcode line, retaining its active-line cursor and highlight timing. */
export const executePlainStep = (machine: Machine) => {
  if (machine.activeLine < 0) {
    machine.activeLine = 0;
  }
  if (machine.activeLine >= machine.compiledCode.length) {
    machine.uncompileCode();
    machine.addLog(machine.t('logs.codeFinished'), 'compiler');
    return;
  }

  const nextSrc = machine.activeLine;
  if (shouldPauseOn(machine, nextSrc)) {
    machine.addLog(machine.t('logs.breakpointPause', { line: nextSrc }), 'system');
    machine._stopRun();
    machine.activeLine = nextSrc;
    if (!machine._headless) {
      machine._refreshHighlight();
    }
    return;
  }

  machine._refreshHighlight();
  const commands = machine.compiledCode[machine.activeLine].split(' ').filter(Boolean);
  machine.nextLine.clear();
  for (const c of commands) {
    machine.nextLine.add(c);
  }
  machine.executeSignalsFromNextLine();
  machine.activeLine++;

  if (machine.activeLine >= machine.compiledCode.length) {
    machine.uncompileCode();
    machine.addLog(machine.t('logs.codeFinished'), 'compiler');
  } else if (!machine._headless) {
    machine._refreshHighlight();
  }
};
