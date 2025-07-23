// microGenerator.js

/**
 * @typedef {Object} MicroPhase
 * @property {boolean} [czyt]   // odczyt z pamięci
 * @property {boolean} [wys]    // przesłanie na magistralę danych
 * @property {boolean} [wei]    // wprowadzenie do rejestru instrukcji
 * @property {boolean} [il]     // inkrementacja licznika L
 * @property {boolean} [wyad]   // wyprowadzenie zakodowanego adresu na magistralę adresową
 * @property {boolean} [wea]    // zapis do rejestru A
 * @property {boolean} [wes]    // zapis do rejestru S
 * @property {boolean} [weja]   // wprowadzenie magistrali danych do ALU
 * @property {boolean} [dod]    // sygnał dodawania w ALU
 * @property {boolean} [weak]   // wprowadzenie wyniku ALU do akumulatora
 * @property {boolean} [wyl]    // przesłanie L→A (przy powrocie do A)
 * // … (dodaj tutaj pozostałe sygnały: ode, przep, readIO, writeIO, itd.) …
 */

/**
 * Struktura wpisu w MicroProgram:
 * @typedef {Object} MicroProgramEntry
 * @property {string}      asmLine – oryginalny tekst instrukcji (do UI)
 * @property {MicroPhase[]} phases  – tablica faz (mikrofaz)
 * @property {string[]}    [labels] – opcjonalne etykiety (jeśli chcesz je zachować)
 */

/**
 * Deklaracja szablonów faz dla poszczególnych rozkazów.
 * Każdy sygnał to nazwa pola w MicroPhase.
 */
const instructionTemplates = {
  // Dodawanie: DOD Ad
  DOD: [
    ['czyt','wys','wei','il'],                // FETCH/DECODE
    ['wyad','wea'],                           // EA: załaduj Ad→A
    ['czyt','wys','weja','dod','weak','wyl','wea'] // EXEC+RETIRE
  ],

  // Ładowanie: LAD Ad  (znane też jako LOAD)
  LAD: [
    ['czyt','wys','wei','il'],                // FETCH/DECODE
    ['wyad','wea'],                           // EA: Ad→A
    ['czyt','wys','weja','wys','wea','wyl']   // EXEC+RETIRE: (Ak)→Mem[ A ]
  ],

  // Skok warunkowy IF ZAK / ELSE
  SOM: [
    ['czyt','wys','wei','il'],                // FETCH/DECODE
    // fazy zależne od flagi Z
    // w generatorze będą wstawiane dynamicznie
  ],
  SOZ: [
    ['czyt','wys','wei','il'],                // FETCH/DECODE
    // analogicznie do SOM
  ],

  // … dodaj tutaj pozostałe instrukcje: JAL, I/O, przerwania, itp. …
};

/**
 * Zamienia listę stringów (nazwy sygnałów) na MicroPhase.
 * @param {string[]} signals
 * @returns {MicroPhase}
 */
function buildPhase(signals) {
  const phase = {};
  for (const s of signals) phase[s] = true;
  return phase;
}

/**
 * Główna funkcja: generuje MicroProgram z AST.
 * @param {Array<Object>} ast – wynik parsowania + semantyki
 * @returns {MicroProgramEntry[]}
 */
export function generateMicroProgram(ast) {
  /** @type {MicroProgramEntry[]} */
  const program = [];

  for (const node of ast) {
    if (node.type !== 'Instruction') continue;

    // 1) przygotuj opis do UI
    const asmLine = node.name
      + (node.operands.length
        ? ' ' + node.operands.map(op => op.type === 'Immediate' ? op.value : op.name).join(', ')
        : '');

    // 2) pobierz szablon
    const tmpl = instructionTemplates[node.name];
    if (!tmpl) {
      throw new Error(`Brak szablonu mikroprogramu dla instrukcji "${node.name}"`);
    }

    // 3) zbuduj fazy na podstawie tablicy stringów
    /** @type {MicroPhase[]} */
    const phases = [];

    // zawsze pierwsza faza FETCH/DECODE
    phases.push(buildPhase(tmpl[0]));

    // kolejne fazy – uwzględnij warunki dla SOM/SOZ
    if (node.name === 'SOM' || node.name === 'SOZ') {
      // przykład dla rozkazów warunkowych:
      const truePhases  = [['wyad','wea'], ['czyt','wys','weja','dod','weak','wyl','wea']];
      const falsePhases = [['wyl','wea']];

      if (node.name === 'SOM' ? /* if ZAK */ true : /* if Z==0 */ false) {
        for (const sigs of truePhases) phases.push(buildPhase(sigs));
      } else {
        for (const sigs of falsePhases) phases.push(buildPhase(sigs));
      }
    } else {
      // pozostałe instrukcje – od drugiego elementu szablonu
      for (let i = 1; i < tmpl.length; i++) {
        phases.push(buildPhase(tmpl[i]));
      }
    }

    program.push({ asmLine, phases });
  }

  return program;
}


export { generateMicroProgram as generateMicro };
