export const DEFAULT_VECTOR_BASE = 0x10;

import type { Store, ConditionalPhase, Phase } from '../model';

//Entire section of a code must be reavaluated after changes in #151

export function initStore(
  memorySize = 256,
  vectorBase = DEFAULT_VECTOR_BASE,
  initialMemoryAssignments: Array<{ addr: number; val: number }> = []
): Store {
  const mem = new Uint8Array(memorySize);
  for (const { addr, val } of initialMemoryAssignments) {
    if (addr >= 0 && addr < memorySize) {
      mem[addr] = val & 0xff;
    } else {
      console.warn(`Adres poza zakresem pamięci: ${addr}`);
    }
  }

  return {
    I: 0,
    L: 0,
    A: 0,
    S: 0,
    Ak: 0,
    magA: 0,
    magS: 0,
    flags: {
      // Z: zero flag (true when Ak == 0)
      Z: false,
      // N: negative flag (true when Ak has MSB set)
      N: false,
      IE: false,
      IR: false,
    },
    mem,
    // Stos danych (DNS/PZS)
    dataStack: [],
    // Stos powrotów (SDP/PWR oraz ISR)
    callStack: [],
    program: [],
    phaseIdx: 0,
    ioIn: [],
    ioOut: [],
    portIn: 0,
    portOut: 0,
    vectorBase,
  };
}

function runISR(store) {
  store.callStack.push({ L: store.L, phaseIdx: store.phaseIdx });
  store.flags.IE = false;
  store.flags.IR = false;
  store.L = store.vectorBase;
  store.phaseIdx = 0;
}

export function applySignals(phase: any, store: Store) {
  if (phase.wyad) store.magA = store.I & 0xff;
  if (phase.wyl) store.magA = store.L & 0xff;
  if (phase.wys) store.magS = store.S;
  if (phase.wyak) store.magS = store.Ak;

  if (phase.czyt) store.S = store.mem[store.magA];
  if (phase.pisz) store.mem[store.magA] = store.S;

  if (phase.weja) store._aluIn = store.magS;

  if (phase.dod) store._aluOut = (store.Ak + store._aluIn) & 0xff;
  if (phase.ode) store._aluOut = (store.Ak - store._aluIn) & 0xff;
  if (phase.mno) store._aluOut = (store.Ak * store._aluIn) & 0xff;
  if (phase.dziel) store._aluOut = Math.floor(store.Ak / (store._aluIn || 1));
  if (phase.shl) store._aluOut = (store.Ak << 1) & 0xff;
  if (phase.shr) store._aluOut = store.Ak >> 1;
  if (phase.neg) store._aluOut = ~store.Ak & 0xff;
  if (phase.lub) store._aluOut = store.Ak | store._aluIn;
  if (phase.i) store._aluOut = store.Ak & store._aluIn;
  if (phase.as) store._aluOut = (store.Ak + 1) & 0xff;
  if (phase.sa) store._aluOut = (store.Ak - 1) & 0xff;

  if (phase.przep) store._aluOut = store._aluIn;

  if (phase.weak) {
    store.Ak = store._aluOut;
    store.flags.Z = (store.Ak & 0xff) === 0;
    store.flags.N = !!(store.Ak & 0x80);
  }

  if (phase.wea) store.A = store.magA;
  if (phase.wes) store.S = store.magS;
  if (phase.wei) store.I = store.magS;
  if (phase.wel) store.L = store.magA;
  if (phase.wyg) {
    const readyBit = (store.ioIn.length > 0) ? 0 : 1;
    store.magS   = readyBit & 0xff;
    store.portIn = readyBit & 0xff;
  }

  if (phase.wyrb) {
    const hasData = store.ioIn.length > 0;
    const v = hasData ? (store.ioIn.shift()! & 0xff) : 0;
    store.magS   = v;
    store.portIn = v;
  }

  if (phase.werb) {
    const v = store.Ak & 0xff;
    store.portOut = v;
    store.ioOut.push(v);
  }

  if (phase.il) {
    store.L = (store.L + 1) & 0xff;
  }

  if (phase.writeIO) {
    // domyślnie wyprowadź zawartość ACC (jeśli nie ustawiono inaczej)
    const outVal = phase.useMagS ? store.magS : store.Ak;
    store.portOut = outVal & 0xff;
    store.ioOut.push(store.portOut);
  }
  if (phase.readIO) {
    store.portIn = store.ioIn.length ? store.ioIn.shift() : 0;
    store.magS = store.portIn & 0xff;
  }

  // Operacje stosu i wywołań
  if (phase.pushAcc) {
    store.dataStack.push(store.Ak & 0xff);
  }
  if (phase.popAcc) {
    const val = store.dataStack.length ? store.dataStack.pop() : 0;
    store.Ak = val & 0xff;
    // odśwież flagi po pobraniu
    store.flags.Z = (store.Ak & 0xff) === 0;
    store.flags.N = !!(store.Ak & 0x80);
  }
  if (phase.call) {
    // zapamiętaj adres powrotu (następna instrukcja, phaseIdx=0)
    store.callStack.push({ L: (store.L + 1) & 0xff, phaseIdx: 0 });
    // skok pod adres z magA
    store.L = store.magA & 0xff;
    store.phaseIdx = 0;
  }
  if (phase.ret) {
    const ctx = store.callStack.length ? store.callStack.pop() : null;
    if (ctx) {
      store.L = ctx.L & 0xff;
      store.phaseIdx = ctx.phaseIdx | 0;
    }
  }
}

// Prosty type-guard do zawężania typu fazy
function isCondPhase(p: Phase): p is ConditionalPhase {
  return !!p && p.conditional === true && 'flag' in p && Array.isArray((p as any).truePhases);
}

export function stepMicro(store: Store) {
  if (store.flags.IE && store.flags.IR) {
    runISR(store);
    return;
  }

  const entry = store.program[store.L];
  if (!entry) {
    throw new Error(`Brak mikroprogramu pod adresem ${store.L}`);
  }

  const phase: any = entry.phases[store.phaseIdx];

  if (isCondPhase(phase)) {
    const conditionMet = store.flags[phase.flag] === true;
    const phases = conditionMet ? phase.truePhases : phase.falsePhases;
    for (const p of phases) applySignals(p, store);
  } else {
    applySignals(phase, store);
  }

  store.phaseIdx++;
  if (store.phaseIdx >= entry.phases.length) {
    store.phaseIdx = 0;

    if (store.L >= store.vectorBase && store.callStack.length) {
      const ctx = store.callStack.pop();
      store.L = ctx.L;
      store.phaseIdx = ctx.phaseIdx;
    } else {
      store.L = (store.L + 1) & 0xff;
    }
  }
}

export function exportStore(store: Store) {
  return JSON.stringify({
    registers: { I: store.I, L: store.L, A: store.A, S: store.S, Ak: store.Ak },
    flags: store.flags,
    memory: Array.from(store.mem),
    program: store.program,
    ioIn: store.ioIn,
    ioOut: store.ioOut,
    dataStack: store.dataStack,
    callStack: store.callStack,
    vectorBase: store.vectorBase,
  });
}

export function importStore(json: string): Store {
  const data = JSON.parse(json);
  const store = initStore(data.memory.length, data.vectorBase, []);
  store.I = data.registers.I;
  store.L = data.registers.L;
  store.A = data.registers.A;
  store.S = data.registers.S;
  store.Ak = data.registers.Ak;
  store.flags = { ...data.flags };
  store.mem = Uint8Array.from(data.memory);
  store.program = data.program;
  store.ioIn = Array.from(data.ioIn);
  store.ioOut = Array.from(data.ioOut);
  store.dataStack = Array.from(data.dataStack || []);
  store.callStack = Array.from(data.callStack || []);
  return store;
}

export function saveState(name: string, store: Store) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(`WMachine_${name}`, exportStore(store));
  }
}

export function loadState(name: string): Store {
  if (typeof localStorage !== 'undefined') {
    const json = localStorage.getItem(`WMachine_${name}`);
    if (!json) throw new Error(`Brak stanu '${name}' w LocalStorage`);
    return importStore(json);
  }
  throw new Error('LocalStorage nie jest dostępne');
}

export function evalFlag(vm: any, flag: 'Z' | 'N' | 'C' | 'V'): boolean {
  switch (flag) {
    case 'Z':
      return (vm.Ak & 0xff) === 0;
    case 'N':
      return !!(vm.Ak & 0x80);
    case 'C':
      return !!vm.flags?.C;
    case 'V':
      return !!vm.flags?.V;
    default:
      return false;
  }
}
