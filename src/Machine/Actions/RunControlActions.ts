import type { Machine, MachineActions } from '../Types/Machine';
import { sleep } from '@/Shared/Utils/Async';
import { clamp } from '@/Shared/Utils/Numbers';

type Actions = Pick<MachineActions, 'stopRun' | 'runCode' | '_stopRun' | 'runToEndFast' | 'clearActiveTimeouts'>;

/** Starts, stops and cancels timed or fast runs without changing the execution cursor rules. */
export const runControlActions: Actions & ThisType<Machine> = {
  stopRun() {
    this._stopRun();
    this.addLog(this.t('logs.stoppedByUser'), 'system');
  },

  runCode() {
    if (this.isRunning || !this.codeCompiled) return;
    this._stopRun();
    this.manualMode = false;
    this._skipNextBreakpoint = true;
    this.isRunning = true;
    const generation = this._runGeneration;
    let stepsLeft = 100000;
    const tickMs = Math.max(1, this.oddDelay);

    if (this.compiledProgram && this.compiledProgram.length > 0 && this.activeInstrIndex < 0) {
      this.activeInstrIndex = 0;
      this.activePhaseIndex = 0;
    }

    const tick = () => {
      if (generation !== this._runGeneration) return;
      if (!this.codeCompiled || !this.isRunning) return this._stopRun();
      this.executeLine();
      stepsLeft--;
      if (generation !== this._runGeneration) return;
      if (!this.codeCompiled || !this.isRunning) return this._stopRun();
      if (stepsLeft <= 0) {
        this.addLog(this.t('logs.runStepLimit'), 'system');
        return this._stopRun();
      }
      this.runLoopTimer = setTimeout(tick, tickMs);
    };
    this.runLoopTimer = setTimeout(tick, tickMs);
  },

  _stopRun() {
    this._runGeneration = (this._runGeneration || 0) + 1;
    if (this.runLoopTimer) {
      clearTimeout(this.runLoopTimer ?? undefined);
      this.runLoopTimer = null;
    }
    this.isRunning = false;
    this.isFastRunning = false;
    this.fastProgress = 0;
    if (this._runningDocumentTitle != null) {
      if (typeof document !== 'undefined') document.title = this._runningDocumentTitle;
      this._runningDocumentTitle = null;
    }

    this._skipNextBreakpoint = false; // ← reset

    this._headless = false;
    this.suppressBroadcast = false;
    this.clearActiveTimeouts();
    this.cancelDeviceOperation();
    if (this._busHoldTimers?.A) {
      clearTimeout(this._busHoldTimers.A);
      this._busHoldTimers.A = null;
    }
    if (this._busHoldTimers?.S) {
      clearTimeout(this._busHoldTimers.S);
      this._busHoldTimers.S = null;
    }
    this.signals.busA = false;
    this.signals.busS = false;
    this.nextLine.clear();
  },

  async runToEndFast() {
    if (!this.codeCompiled || this.isFastRunning) return;

    this._stopRun();

    this.manualMode = false;
    this.clearActiveTimeouts();

    this._headless = true;
    this.suppressBroadcast = true;

    this.isRunning = true;
    this.isFastRunning = true;
    this.fastProgress = 0;
    this._skipNextBreakpoint = true;
    const generation = this._runGeneration;
    if (typeof document !== 'undefined') {
      this._runningDocumentTitle = document.title;
      document.title = '▶️ Running…';
    }
    const isCurrentRun = () => generation === this._runGeneration && this.isRunning && this.isFastRunning;

    try {
      const hasStructured = Array.isArray(this.compiledProgram) && this.compiledProgram.length > 0;
      const totalInstr = hasStructured ? this.compiledProgram.length : this.compiledCode?.length || 0;

      if (hasStructured && this.activeInstrIndex < 0) {
        this.activeInstrIndex = 0;
        this.activePhaseIndex = 0;
      } else if (!hasStructured) {
        this.activeLine = Math.max(this.activeLine, 0);
      }

      let safety = 200_000;
      const CHUNK = 1200;

      while (this.codeCompiled && safety > 0 && isCurrentRun()) {
        for (let i = 0; i < CHUNK && safety > 0 && this.codeCompiled && isCurrentRun(); i++, safety--) {
          if (hasStructured) {
            if (this.activeInstrIndex < 0 || this.activeInstrIndex >= this.compiledProgram.length) {
              this.uncompileCode();
              break;
            }
            this.executeLine(/* headless → patrz niżej */);
          } else {
            if (this.activeLine >= this.compiledCode.length) {
              this.uncompileCode();
              break;
            }
            this.executeLine();
          }
        }
        if (!isCurrentRun() || !this.codeCompiled) break;

        // progres bez malowania UI (tylko liczba)
        if (hasStructured) {
          const cur = clamp(this.activeInstrIndex, 0, totalInstr);
          this.fastProgress = totalInstr ? Math.floor((cur / totalInstr) * 100) : 0;
        } else {
          const cur = clamp(this.activeLine, 0, totalInstr);
          this.fastProgress = totalInstr ? Math.floor((cur / totalInstr) * 100) : 0;
        }

        // daj event loopowi odetchnąć
        await sleep(0);

        if (!this.codeCompiled || !isCurrentRun()) break;
        if (hasStructured && (this.activeInstrIndex < 0 || this.activeInstrIndex >= this.compiledProgram.length)) break;
        if (!hasStructured && this.activeLine >= this.compiledCode.length) break;
      }

      if (safety <= 0 && isCurrentRun()) this.addLog(this.t('logs.runFastLimit'), 'system');
    } finally {
      // A cancelled async chunk must never stop a subsequently started run.
      if (generation === this._runGeneration) this._stopRun();
    }
  },

  clearActiveTimeouts() {
    // Clear all active timeouts and reset all signals to false
    this.activeTimeouts.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.activeTimeouts = [];
    // Immediately turn off all signals
    for (const key in this.signals) {
      this.signals[key] = false;
    }
  },
};
