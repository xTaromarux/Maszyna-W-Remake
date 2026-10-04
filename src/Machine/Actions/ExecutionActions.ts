import { getErrorMessage } from '@/Shared/Utils/Errors';
import type { Machine, MachineActions } from '@/Machine/Types/Machine';
import { clamp } from '../../Shared/Utils/Numbers';
import { executePlainStep, executeStructuredStep } from '../ExecuteProgramStep';

type Actions = Pick<
  MachineActions,
  | 'toggleBreakpoint'
  | '_shouldPauseOnBreakpoint'
  | 'holdBus'
  | 'to8'
  | 'toWord'
  | 'wordMask'
  | 'addrMask'
  | 'stackPush'
  | 'stackPop'
  | 'handleProgramSectionCompile'
  | 'handleAsmAutoReset'
  | 'applyInitMemory'
  | 'checkConflict'
  | 'handleSignalToggle'
  | 'loadSelectedLab'
  | 'compileCode'
  | 'uncompileCode'
  | 'handleInterrupt'
  | 'executeLine'
  | '_refreshHighlight'
  | 'getResolvedPhase'
  | 'evaluateFlag'
  | 'resetValues'
>;

/** Existing execution operations, bound to the machine by the store. */
export const executionActions: Actions & ThisType<Machine> = {
  toggleBreakpoint(lineIdx) {
    if (typeof lineIdx !== 'number') return;
    if (this.breakpoints.has(lineIdx)) this.breakpoints.delete(lineIdx);
    else this.breakpoints.add(lineIdx);
    this.addLog(this.t(`logs.breakpoint.${this.breakpoints.has(lineIdx) ? 'added' : 'removed'}`, { line: lineIdx }), 'system');
  },

  _shouldPauseOnBreakpoint(nextSrcLine) {
    return this.isRunning && Number.isFinite(nextSrcLine) && this.breakpoints.has(nextSrcLine);
  },

  holdBus(which) {
    // 'A' lub 'S'
    const key = which === 'A' ? 'busA' : 'busS';
    this.signals[key] = true;
    const slot = which === 'A' ? 'A' : 'S';
    if (this._busHoldTimers[slot]) clearTimeout(this._busHoldTimers[slot] ?? undefined);
    this._busHoldTimers[slot] = setTimeout(() => {
      this.signals[key] = false;
      this._busHoldTimers[slot] = null;
    }, this.busHoldMs);
  },

  to8(v) {
    return v & 0xff;
  },

  // Dynamic word size masking based on machine word size (codeBits + addresBits)
  toWord(v) {
    return v & this.wordMask();
  },

  // Dynamic word mask based on actual machine word size (codeBits + addresBits)
  wordMask() {
    return (1 << (this.codeBits + this.addresBits)) - 1;
  },

  addrMask() {
    return (1 << this.addresBits) - 1;
  },

  stackPush(type, value) {
    const entry = { type, value: value & this.wordMask() };
    this.stack.push(entry);

    // AP is the interrupt-handler address, independent of return addresses stored on the stack.
    this.addLog(this.t('logs.stackPush', { type, value: entry.value, ws: this.WS, size: this.stack.length }), 'stack');
  },

  stackPop(expectedType) {
    if (this.stack.length === 0) {
      this.addLog(this.t('logs.stackPopEmpty'), 'error');
      return 0;
    }

    const entry = this.stack.pop()!;

    if (expectedType && entry.type !== expectedType) {
      this.addLog(this.t('logs.stackPopExpected', { expected: expectedType, actual: entry.type }), 'warning');
    }

    this.addLog(this.t('logs.stackPop', { type: entry.type, value: entry.value, ws: this.WS, size: this.stack.length }), 'stack');

    return entry.value;
  },

  handleProgramSectionCompile(payload) {
    this._stopRun();
    this._pendingStackWrite = null;
    this._pendingStackRead = null;
    // Accept both legacy string and structured payload from ProgramSection
    if (typeof payload === 'string') {
      this.code = payload;
      this.compiledCode = payload
        .split('\n')
        .map((l) => l.replace(/;\s*$/, ''))
        .filter((l) => l.trim() !== '');
      this.compiledProgram = [];
      this.codeCompiled = true;
      this.activeLine = -1;
      this.activeInstrIndex = -1;
      this.activePhaseIndex = 0;
      this.nextLine.clear();
      return;
    }

    const { text, program } = payload || {};
    if (typeof text === 'string') {
      this.code = text;
      this.compiledCode = text
        .split('\n')
        .map((l) => l.replace(/;\s*$/, ''))
        .filter((l) => l.trim() !== '');
    }
    this.compiledProgram = Array.isArray(program) ? program : [];
    this.codeCompiled = true;
    this.activeLine = -1;
    this.activeInstrIndex = -1;
    this.activePhaseIndex = 0;
    this.nextLine.clear();
    this.addLog(this.t('logs.programCompiledStructured'), 'compiler');
  },

  handleAsmAutoReset() {
    if (!this.autoResetOnAsmCompile) return;
    this.resetValues({
      resetLogs: false,
      logMessage: this.t('logs.asmAutoReset'),
    });
  },

  applyInitMemory(assignments) {
    // assignments: Array<{ addr:number, val:number }>
    const size = 1 << this.addresBits;
    const nextMem = new Array(size).fill(0);

    for (let i = 0; i < Math.min(this.mem.length, size); i++) nextMem[i] = this.mem[i];
    const mask = this.wordMask();
    for (const { addr, val } of assignments) {
      if (addr >= 0 && addr < size) {
        nextMem[addr] = val & mask;
      } else {
        this.addLog(this.t('logs.memoryInitOutOfRange', { addr }), 'error');
      }
    }
    this.mem = nextMem;
    this.addLog(this.t('logs.memoryInitApplied', { count: assignments.length }), 'system');
  },

  checkConflict(signalName) {
    // Groups of mutually conflicting signals:
    const groups = [
      ['wyad', 'wyl'],
      ['wys', 'wyak'],
      ['il', 'wel'],
      ['czyt', 'pisz'],
      ['iak', 'dak'],
    ];
    // One JAML Operation at a Time Group:
    const jalOperations = ['dod', 'ode', 'przep', 'mno', 'dziel', 'shr', 'shl', 'neg', 'lub', 'i'];

    for (const group of groups) {
      if (group.includes(signalName)) {
        for (const other of group) {
          if (other === signalName) continue;
          if (this.signals[other]) {
            return this.t('signals.conflict', { signal: signalName, other });
          }
        }
      }
    }

    if (jalOperations.includes(signalName)) {
      for (const other of jalOperations) {
        if (other === signalName) continue;
        if (this.signals[other]) {
          return this.t('signals.conflictJaml', { signal: signalName, other });
        }
      }
    }

    return null;
  },

  handleSignalToggle(signalName) {
    if (!this.manualMode) return;

    const willBeOn = !this.signals[signalName];

    if (willBeOn) {
      const conflictMsg = this.checkConflict(signalName);
      if (conflictMsg) {
        if (this.errorTimeoutId) {
          clearTimeout(this.errorTimeoutId ?? undefined);
        }
        this.errorMessage = conflictMsg;
        this.errorTimeoutId = setTimeout(() => {
          this.errorMessage = '';
          this.errorTimeoutId = null;
        }, 3000);
        return;
      }
    }

    this.errorMessage = '';
    if (this.errorTimeoutId) {
      clearTimeout(this.errorTimeoutId ?? undefined);
      this.errorTimeoutId = null;
    }

    if (this.nextLine.has(signalName)) {
      this.nextLine.delete(signalName);
      this.signals[signalName] = false;
    } else {
      this.nextLine.add(signalName);
      this.signals[signalName] = true;
    }

    this.sendSignalToESP(signalName, this.signals[signalName]);
  },

  loadSelectedLab() {
    const selected = this.selectedLab;
    if (!selected) return;

    if (this.manualMode) {
      this.manualModeUncheck();
    }

    this.uncompileCode();
    this.program = selected.asmStub || '';
    this.labDialogOpen = false;
    this.closePopups('settingsOpen');
    this.addLog(this.t('logs.labLoaded', { title: this.t(selected.titleKey) }), 'system');
  },

  compileCode() {
    this._stopRun();
    try {
      if (!this.code || !this.code.trim()) {
        throw new Error(this.t('execution.noCodeToCompile'));
      }

      this.compiledProgram = [];
      this.compiledCode = this.code
        .split(';')
        .map((line) => line.replace(/\r?\n/g, ' ').trim())
        .filter((line) => line.length > 0);

      this.codeCompiled = true;
      this.activeInstrIndex = -1;
      this.activePhaseIndex = 0;
      this.activeLine = -1;
      this._condState = null;
      this._stepGuard = 0;
      this.nextLine.clear();

      this._pendingStackWrite = null;
      this._pendingStackRead = null;

      this.executeLine();
      this.addLog(this.t('logs.asmCompiled'), 'compiler');
    } catch (e) {
      this.addLog(this.t('logs.asmCompileError', { message: getErrorMessage(e, String(e)) }), 'error');
    }
  },

  uncompileCode() {
    this._stopRun();
    this._pendingStackWrite = null;
    this._pendingStackRead = null;
    this.codeCompiled = false;
    this.nextLine.clear();
    this.activeInstrIndex = -1;
    this.activePhaseIndex = 0;
    this._condState = null;
    this._stepGuard = 0;
  },

  handleInterrupt() {
    const irqNum = this.highestPriorityIRQ;
    if (!irqNum) {
      this.addLog(this.t('logs.handleInterruptNone'), 'warning');
      return;
    }

    this.addLog(this.t('logs.separator'), 'interrupt');
    this.addLog(this.t('logs.interruptStart', { num: irqNum }), 'interrupt');

    this.RP = irqNum;
    this.addLog(this.t('logs.interruptRp', { num: irqNum }), 'interrupt');

    const returnAddr = this.programCounter;
    this.stackPush('Address', returnAddr);

    const size = 1 << this.addresBits;
    this.WS = (this.WS - 1 + size) % size;
    const idx = this.WS & this.addrMask();
    this.mem[idx] = returnAddr;
    this.addLog(this.t('logs.interruptStackSaved', { pc: returnAddr, ws: this.WS }), 'interrupt');

    const vectorAddress = irqNum;

    if (vectorAddress < 0 || vectorAddress >= this.compiledProgram.length) {
      this.addLog(this.t('logs.interruptVectorOob', { vector: vectorAddress }), 'error');
      return;
    }

    this.A = vectorAddress;
    this.programCounter = vectorAddress;

    this.addLog(this.t('logs.interruptALoad', { a: this.A }), 'interrupt');
    this.addLog(this.t('logs.interruptPcSet', { vector: vectorAddress, num: irqNum }), 'interrupt');

    this.activeInstrIndex = vectorAddress;
    this.activePhaseIndex = 0;

    const vectorInstr = this.compiledProgram[vectorAddress];
    this.addLog(this.t('logs.interruptExec', { line: vectorInstr?.asmLine || 'SOB' }), 'interrupt');

    this.RZ &= ~(1 << (irqNum - 1));
    this.addLog(this.t('logs.interruptRzClear', { rz: this.RZ, num: irqNum }), 'interrupt');

    this.addLog(this.t('logs.separator'), 'interrupt');
  },

  executeLine() {
    if (this.codeCompiled && Array.isArray(this.compiledProgram) && this.compiledProgram.length > 0) {
      executeStructuredStep(this);
      return;
    }

    if (!this.manualMode) {
      executePlainStep(this);
      return;
    }

    this.executeSignalsFromNextLine();
    if (!this._headless) this._refreshHighlight();
  },

  _refreshHighlight() {
    if (!this.codeCompiled) return;
    // Plain microcode uses activeLine as its execution cursor. Rebuilding it
    // from the structured-program indices would rewind every step to zero.
    if (!this.compiledProgram?.length) {
      this.activeLine = clamp(this.activeLine, 0, Math.max(0, this.compiledCode.length - 1));
      return;
    }

    if (this._condState) {
      const st = this._condState;
      if (st.stage === 'SHOW_IF') {
        if (typeof st.phaseRef?.srcLine === 'number' && Number.isFinite(st.phaseRef?.srcLine)) {
          this.activeLine = st.phaseRef.srcLine;
          return;
        }
      }

      const idx = Math.min(st.idx ?? 0, (st.list?.length ?? 1) - 1);
      const curr = st.list?.[idx];
      if (curr && typeof curr.srcLine === 'number' && Number.isFinite(curr.srcLine)) {
        this.activeLine = curr.srcLine;
        return;
      }
      if (typeof st.phaseRef?.srcLine === 'number' && Number.isFinite(st.phaseRef?.srcLine)) {
        this.activeLine = st.phaseRef.srcLine + (st.pick === 'T' ? 1 : 2);
        return;
      }
    }

    if (Array.isArray(this.compiledProgram) && this.compiledProgram.length > 0) {
      const instr = this.compiledProgram[this.activeInstrIndex];
      const phase = instr?.phases?.[this.activePhaseIndex];

      if (phase && typeof phase.srcLine === 'number' && Number.isFinite(phase.srcLine)) {
        this.activeLine = phase.srcLine;
        return;
      }
      if (instr && typeof instr.srcLine === 'number' && Number.isFinite(instr.srcLine)) {
        this.activeLine = instr.srcLine;
        return;
      }
    }

    let line = 0;
    const instrIdx = Math.max(0, this.activeInstrIndex);
    for (let i = 0; i < instrIdx; i++) {
      const phs = this.compiledProgram[i]?.phases || [];
      for (const p of phs) line += p && p.conditional === true ? 3 : 1;
      const extra = this.compiledProgram[i]?.meta?.postAsm;
      if (Array.isArray(extra)) line += extra.length;
    }
    const currPh = this.compiledProgram[instrIdx]?.phases || [];
    for (let k = 0; k < Math.max(0, this.activePhaseIndex); k++) {
      const p = currPh[k];
      line += p && p.conditional === true ? 3 : 1;
    }
    this.activeLine = line;

    const max = (this.compiledCode?.length || 1) - 1;
    this.activeLine = clamp(this.activeLine || 0, 0, max);
  },

  getResolvedPhase(phase) {
    if (!phase) return {};
    if (phase.conditional === true) {
      const flag = phase.flag;
      const cond = this.evaluateFlag(flag);
      const branch = cond ? phase.truePhases : phase.falsePhases;
      return branch && branch[0] ? branch[0] : {};
    }
    return phase;
  },

  evaluateFlag(flag) {
    if (!flag) return false;
    const f = String(flag).toUpperCase();
    const acc8 = this.ACC & this.wordMask();
    const SIGN = 1 << (this.codeBits + this.addresBits - 1);

    switch (f) {
      case 'ZAK':
      case 'ZERO':
      case 'Z':
        return acc8 === 0;
      case 'NEG':
      case 'N':
      case 'M':
        return (acc8 & SIGN) !== 0;
      case 'NZ':
      case 'NZERO':
        return acc8 !== 0;
      case 'POS':
      case 'P':
        return (acc8 & SIGN) === 0;
      default:
        return false;
    }
  },

  resetValues(options = {}) {
    const { resetMemory = true, resetLogs = true, logMessage = this.t('logs.registersReset') } = options;
    this._stopRun();
    // Clear any active timeouts first
    this.clearActiveTimeouts();

    // Reset all register values to 0
    this.programCounter = 0;
    this.I = 0;
    this.ACC = 0;
    this.A = 0;
    this.S = 0;
    this.X = 0;
    this.Y = 0;
    this.RM = 0;
    this.RZ = 0;
    this.AP = 0;
    this.RP = 0;
    this.WS = 0;
    this.G = 0;
    this.RB = 0;
    this.JAML = 0;
    this.BusA = 0;
    this.BusS = 0;

    // Reset stack
    this.stack = [];
    this._pendingStackWrite = null;
    this._pendingStackRead = null;

    // Reset memory to all zeros
    if (resetMemory) {
      this.mem = new Array(1 << this.addresBits).fill(0);
    }

    // Reset all signals to false
    for (const key in this.signals) {
      this.signals[key] = false;
    }

    this.nextLine.clear();

    // Clear console logs
    if (resetLogs) {
      this.logs = [];
      this.hasConsoleErrors = false;
    }

    if (logMessage) {
      this.addLog(logMessage, 'system');
    }
  },
};
