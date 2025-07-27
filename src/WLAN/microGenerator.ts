const instructionTemplates = {
  POB: [
    ['czyt', 'wys', 'wei', 'il'],
    ['wyad', 'wea'],
    ['czyt', 'wys', 'weja', 'weak', 'wyl', 'wea'],
  ],
  DOD: [
    ['czyt', 'wys', 'wei', 'il'],
    ['wyad', 'wea'],
    ['czyt', 'wys', 'weja', 'dod', 'weak', 'wyl', 'wea'],
  ],
  ODE: [
    ['czyt', 'wys', 'wei', 'il'],
    ['wyad', 'wea'],
    ['czyt', 'wys', 'weja', 'ode', 'weak', 'wyl', 'wea'],
  ],
  STP: [['czyt', 'wys', 'wei', 'il']],
  ZAM: [
    ['czyt', 'wys', 'wei', 'il'],
    ['wyad', 'wea'],
    ['czyt', 'wys', 'weja', 'wea'],
  ],
  PRZEP: [
    ['czyt', 'wys', 'wei', 'il'],
    ['wyad', 'wea'],
    ['czyt', 'wys', 'weja', 'przep', 'weak', 'wyl', 'wea'],
  ],
  MNO: [
    ['czyt', 'wys', 'wei', 'il'],
    ['wyad', 'wea'],
    ['czyt', 'wys', 'weja', 'mno', 'weak', 'wyl', 'wea'],
  ],
  DZIEL: [
    ['czyt', 'wys', 'wei', 'il'],
    ['wyad', 'wea'],
    ['czyt', 'wys', 'weja', 'dziel', 'weak', 'wyl', 'wea'],
  ],
  SHR: [
    ['czyt', 'wys', 'wei', 'il'],
    ['wyad', 'wea'],
    ['czyt', 'wys', 'weja', 'shr', 'weak', 'wyl', 'wea'],
  ],
  SHL: [
    ['czyt', 'wys', 'wei', 'il'],
    ['wyad', 'wea'],
    ['czyt', 'wys', 'weja', 'shl', 'weak', 'wyl', 'wea'],
  ],
  NEG: [
    ['czyt', 'wys', 'wei', 'il'],
    ['wyad', 'wea'],
    ['czyt', 'wys', 'weja', 'neg', 'weak', 'wyl', 'wea'],
  ],
  LUB: [
    ['czyt', 'wys', 'wei', 'il'],
    ['wyad', 'wea'],
    ['czyt', 'wys', 'weja', 'lub', 'weak', 'wyl', 'wea'],
  ],
  I: [
    ['czyt', 'wys', 'wei', 'il'],
    ['wyad', 'wea'],
    ['czyt', 'wys', 'weja', 'i', 'weak', 'wyl', 'wea'],
  ],
  AS: [
    ['czyt', 'wys', 'wei', 'il'],
    ['wyad', 'wea'],
    ['czyt', 'wys', 'weja', 'as', 'weak', 'wyl', 'wea'],
  ],
  SA: [
    ['czyt', 'wys', 'wei', 'il'],
    ['wyad', 'wea'],
    ['czyt', 'wys', 'weja', 'sa', 'weak', 'wyl', 'wea'],
  ],
  READIO: [
    ['czyt', 'wys', 'wei', 'il'],
    ['readIO', 'weja', 'weak', 'wyl', 'wea'],
  ],
  WRITEIO: [
    ['czyt', 'wys', 'wei', 'il'],
    ['weja', 'writeIO', 'wyl', 'wea'],
  ],
  STOP: [['czyt', 'wys', 'wei', 'il']],
  ŁAD: [
    ['czyt', 'wys', 'wei', 'il'],
    ['weja', 'przep', 'weak', 'wyl', 'wea'],
  ],
  SOB: [
    ['czyt', 'wys', 'wei', 'il'],
    ['wyad', 'wel', 'wea'],
  ],
  WYP: [['czyt', 'wys', 'wei', 'il'], ['writeIO']],
};

/**
 * Tworzy fazę mikroinstrukcji z listy sygnałów
 * @param {string[]} signals
 * @returns {MicroPhase}
 */
function buildPhase(signals) {
  const phase = {};
  for (const s of signals) {
    phase[s] = true;
  }
  return phase;
}

/**
 * Główna funkcja: generuje mikroprogram z AST
 * @param {Array<Object>} ast
 * @returns {MicroProgramEntry[]}
 */
export function generateMicroProgram(ast) {
  const program = [];

  for (const node of ast) {
    if (node.type !== 'Instruction') continue;

    const name = node.name.toUpperCase();
    const asmLine = name + (node.operands?.length ? ' ' + node.operands.map((op) => op.value ?? op.name).join(', ') : '');

    const phases = [];

    if (name === 'SOM' || name === 'SOZ') {
      const flag = name === 'SOM' ? 'Z' : 'ZAK';
      phases.push(buildPhase(['czyt', 'wys', 'wei', 'il']));
      phases.push({
        conditional: true,
        flag,
        truePhases: [buildPhase(['wyad', 'wel', 'wea'])],
        falsePhases: [buildPhase(['wyl', 'wea'])],
      });
    } else {
      const template = instructionTemplates[name];
      if (!template) throw new Error(`Brak szablonu mikroprogramu dla instrukcji "${name}"`);

      for (const sigList of template) {
        phases.push(buildPhase(sigList));
      }
    }

    program.push({ asmLine, phases });
  }

  return program;
}

// Aliasy
export { generateMicroProgram as generateMicro };
