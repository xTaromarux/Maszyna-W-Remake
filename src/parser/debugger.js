// debugger.js
import { initStore, stepMicro } from './simulator.js';

export class Debugger {
  constructor(store) {
    this.store = store;
    this.breakpoints = new Set();  // zbiór adresów PC
    this.paused = false;
    this.autoInterval = null;
  }

  addBreakpoint(addr) {
    this.breakpoints.add(addr);
  }
  removeBreakpoint(addr) {
    this.breakpoints.delete(addr);
  }

  /**
   * Tryb ręczny: wykonaj jedną fazę (takt)
   */
  stepPhase() {
    stepMicro(this.store);
    this.paused = true;
  }

  /**
   * Tryb ręczny: wykonaj jedną instrukcję
   */
  stepInstr() {
    // jeśli na początku instrukcji i jest breakpoint, pomiń go raz
    if (this.store.phaseIdx === 0 && this.breakpoints.has(this.store.L)) {
      stepMicro(this.store);
    }
    do {
      stepMicro(this.store);
    } while (this.store.phaseIdx !== 0);
    this.paused = true;
  }

  /**
   * Run do next breakpoint or end (blokująco)
   */
  run() {
    this.paused = false;
    while (!this.paused) {
      if (this.store.phaseIdx === 0 && this.breakpoints.has(this.store.L)) {
        this.paused = true;
        break;
      }
      stepMicro(this.store);
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
    const memSize = this.store.mem.length;
    this.store = initStore(memSize);
    this.paused = false;
  }

  /**
   * Uruchamia automatyczne taktowanie co `delay` ms aż do breakpointa/końca :contentReference[oaicite:4]{index=4}
   */
  startAuto(delay = 500) {
    this.stopAuto();
    this.autoInterval = setInterval(() => {
      if (this.store.phaseIdx === 0 && this.breakpoints.has(this.store.L)) {
        this.pause();
      } else {
        stepMicro(this.store);
      }
    }, delay);
  }

  stopAuto() {
    if (this.autoInterval) {
      clearInterval(this.autoInterval);
      this.autoInterval = null;
    }
  }
}
