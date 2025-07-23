// main.js
import { lex } from './lexer.js';
import { parse } from './parser.js';
import {
  collectLabels,
  validateOperands,
  resolveLabelRefs
} from './semanticAnalyzer.js';
import { generateMicroProgram } from './microGenerator.js';
import { initStore } from './simulator.js';
import { Debugger } from './debugger.js';

export function compile(source) {
  // 1. Lexing
  const tokens = lex(source);

  // 2. Parsing
  const ast = parse(source);

  // 3. Semantyka
  const symtab = collectLabels(ast);
  validateOperands(ast);
  resolveLabelRefs(ast, symtab);

  // 4. Mikroprogram
  const microProgram = generateMicroProgram(ast);

  // 5. Inicjalizacja symulatora i debuggera
  const store = initStore(256);
  store.program = microProgram;
  const dbg = new Debugger(store);

  return { ast, symtab, microProgram, store, debugger: dbg };
}
