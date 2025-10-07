import { initStore, stepMicro } from './simulator.js';
import type { Store, MicroProgramEntry } from './model';
export class Debugger {
  store: Store;
  _initialSnapshot: any;
  breakpoints: Set<number>;
  paused: boolean;
  autoInterval: NodeJS.Timeout | null;
  log: any[];
  _listeners: Record<string, Array<(data: any) => void>>;
  constructor(store: Store) {
    this.store = store;
    this._initialSnapshot = JSON.parse(JSON.stringify(store));
    this.breakpoints = new Set();
    this.paused = false;
    this.autoInterval = null;
    this.log = [];
    this._listeners = {};
  }
  on(event: string, callback: (data: any) => void) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(callback);
  }
  _emit(event: string, data: any) {
    for (const cb of this._listeners[event] || []) {
      cb(data);
    }
  }
  addBreakpoint(addr: number) {
    this.breakpoints.add(addr);
  }
  removeBreakpoint(addr: number) {
    this.breakpoints.delete(addr);
  }
  stepPhase() {
    const entry = this.store.program[this.store.L];
    const phaseIdx = this.store.phaseIdx;
    const phase = entry?.phases?.[phaseIdx] || {};
    this.log.push({
      type: 'phase',
      L: this.store.L,
      asmLine: entry?.asmLine || null,
      phaseIdx,
      phase,
    });
    this._emit('step', { type: 'phase', store: this.store });
    stepMicro(this.store);
    this.paused = true;
  }
  stepInstr() {
    if (this.store.phaseIdx === 0 && this.breakpoints.has(this.store.L)) {
      this.paused = true;
      return;
    }
    const startL = this.store.L;
    do {
      this.stepPhase();
    } while (!this.paused || this.store.phaseIdx !== 0);
    const lastLine = this.store.program[startL]?.asmLine || null;
    this.log.push({ type: 'instr', L: startL, asmLine: lastLine });
    this._emit('step', { type: 'instr', store: this.store });
    this.paused = true;
  }
  run() {
    this.paused = false;
    while (!this.paused) {
      if (this.store.phaseIdx === 0 && this.breakpoints.has(this.store.L)) {
        this.paused = true;
        break;
      }
      this.stepPhase();
    }
  }
  continue() {
    this.run();
  }
  pause() {
    this.paused = true;
    this.stopAuto();
  }
  reset() {
    const size = this.store.mem.length;
    const vb = this.store.vectorBase;
    const snapshot = JSON.parse(JSON.stringify(this._initialSnapshot));
    const assignments = Array.from(snapshot.mem)
      .map((val, addr) => ({ addr, val: Number(val) }))
      .filter((entry) => typeof entry.val === 'number' && entry.val !== 0);
    const restored = initStore(size, vb, assignments);
    Object.assign(restored, snapshot);
    this.store = restored as Store;
    this.paused = false;
    this.log = [];
    this._emit('reset', { store: this.store });
  }
  startAuto(delay = 500) {
    this.stopAuto();
    this.paused = false;
    this.autoInterval = setInterval(() => {
      if (this.store.phaseIdx === 0 && this.breakpoints.has(this.store.L)) {
        this.pause();
        return;
      }
      this.stepPhase();
      if (this.store.phaseIdx === 0 && this.breakpoints.has(this.store.L)) {
        this.pause();
      }
    }, delay);
  }
  stopAuto() {
    if (this.autoInterval) {
      clearInterval(this.autoInterval);
      this.autoInterval = null;
    }
  }
  getLog() {
    return this.log.slice();
  }
  isPaused() {
    return this.paused;
  }
}