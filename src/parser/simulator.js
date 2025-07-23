// simulator.js

export const VECTOR_BASE = 0x10; // baza wektora przerwania

/**
 * Inicjalizuje stan maszyny W, rozszerzony o I/O i przerwania
 */
export function initStore(memorySize = 256) {
  return {
    // Rejestry
    I: 0,    // instrukcja
    L: 0,    // licznik rozkazów (PC)
    A: 0,    // rejestr adresowy
    S: 0,    // rejestr słowa
    Ak: 0,   // akumulator

    // Magistrale
    magA: 0,
    magS: 0,

    // Flagi
    flags: {
      Z: false,
      IE: false,  // interrupt enable
      IR: false   // interrupt request
    },

    // Pamięć
    mem: new Uint8Array(memorySize).fill(0),

    // Stos kontekstu ISR
    stack: [],

    // Mikroprogram
    program: /** MicroProgramEntry[] */ [],

    // Aktualny indeks fazy
    phaseIdx: 0,

    // I/O
    ioIn: [],       // kolejka input
    ioOut: [],      // kolejka output
    portIn: 0,      // zawartość portu wejściowego
    portOut: 0      // zawartość portu wyjściowego
  };
}

/**
 * Uruchamia ISR: zapisuje bieżący kontekst, skacze na VECTOR_BASE, wyłącza IR/IE
 */
function runISR(store) {
  // zachowaj powrót
  store.stack.push({ L: store.L, phaseIdx: store.phaseIdx });
  store.flags.IE = false;
  store.flags.IR = false;
  store.L = VECTOR_BASE;
  store.phaseIdx = 0;
}

/**
 * Aplikuje sygnały poziome i impulsowe, w tym I/O
 * @param {MicroPhase} phase
 * @param {ReturnType<typeof initStore>} store
 */
export function applySignals(phase, store) {
  // — poziome sygnały magistral
  if (phase.wyl)   store.magA = store.L;
  if (phase.wyad)  store.magA = store.I & 0xFF;
  if (phase.wyak)  store.magS = store.Ak;
  if (phase.wys)   store.magS = store.S;
  if (phase.czyt)  store.S    = store.mem[store.A];
  if (phase.pisz)  store.mem[store.A] = store.S;

  // — ALU / JAL
  if (phase.weja)  store._aluIn = store.magS;
  if (phase.przep) store._aluOut = store._aluIn;
  if (phase.dod)   store._aluOut = (store.Ak + store._aluIn) & 0xFF;
  if (phase.ode)   store._aluOut = (store.Ak - store._aluIn) & 0xFF;
  if (phase.mno)   store._aluOut = (store.Ak * store._aluIn) & 0xFF;
  if (phase.weak) {
    store.Ak = store._aluOut;
    store.flags.Z = !!(store.Ak & 0x80);
  }

  // — impulsy do rejestrów
  if (phase.wea)  store.A = store.magA;
  if (phase.wes)  store.S = store.magS;
  if (phase.wei)  store.I = store.magS;
  if (phase.wel)  store.L = store.magA;

  // — inkrementacja PC
  if (phase.il) {
    store.L = (store.L + 1) & 0xFF;
  }

  // — I/O
  if (phase.writeIO) {
    // wyjście: zapisz magS do portOut i bufora
    store.portOut = store.magS;
    store.ioOut.push(store.portOut);
  }
  if (phase.readIO) {
    // wejście: pobierz pierwszy element z kolejki ioIn
    store.portIn = store.ioIn.length ? store.ioIn.shift() : 0;
    store.magS = store.portIn;
  }

  // TODO: inne sygnały (as/sa, dziel, shr, shl, neg, lub, i, itd.)
}

/**
 * Wykonuje jedną fazę mikrocyklu, z obsługą przerwań i powrotu z ISR
 * @param {ReturnType<typeof initStore>} store
 */
export function stepMicro(store) {
  // — 9. Obsługa przerwań: jeśli IE&&IR, od razu ISR :contentReference[oaicite:0]{index=0}
  if (store.flags.IE && store.flags.IR) {
    runISR(store);
    return;
  }

  // — pobierz bieżący wpis i fazę
  const entry = store.program[store.L];
  if (!entry) throw new Error(`Brak instrukcji pod adresem ${store.L}`);
  const phase = entry.phases[store.phaseIdx];

  // — wykonaj fazę
  applySignals(phase, store);

  // — przejdź dalej
  store.phaseIdx++;
  if (store.phaseIdx >= entry.phases.length) {
    store.phaseIdx = 0;
    // powrót z ISR czy normalny PC+1?
    if (store.L >= VECTOR_BASE && store.stack.length) {
      const ctx = store.stack.pop();
      store.L = ctx.L;
      store.phaseIdx = ctx.phaseIdx;
    } else {
      store.L = (store.L + 1) & 0xFF;
    }
  }
}
