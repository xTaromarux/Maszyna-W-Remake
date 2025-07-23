// semanticAnalyzer.js

class SymbolTable {
  constructor() {
    this.table = new Map();
  }

  define(name, address) {
    if (this.table.has(name)) {
      throw new Error(`Duplicate label "${name}"`);
    }
    this.table.set(name, address);
  }

  lookup(name) {
    if (!this.table.has(name)) {
      throw new Error(`Undefined label "${name}"`);
    }
    return this.table.get(name);
  }

  has(name) {
    return this.table.has(name);
  }
}

/**
 * 1st pass: zbiera definicje etykiet i dyrektywy adresowe,
 * oraz ustala adres każdej instrukcji/sekcji danych.
 */
function collectLabels(ast) {
  const symtab = new SymbolTable();
  let currentAddress = 0;

  for (const node of ast) {
    switch (node.type) {
      case 'LabelDefinition':
        symtab.define(node.name, currentAddress);
        break;
      case 'Directive': {
        if (node.name === 'ORG') {
          currentAddress = node.operands[0].value;
        } else if (node.name === 'DATA') {
          // zakładamy .DATA val1, val2, ...
          currentAddress += node.operands.length;
        }
        break;
      }
      case 'Instruction':
        currentAddress += 1; // każda instrukcja zajmuje 1 słowo
        break;
      default:
      // pozostałe węzły ignorujemy
    }
  }

  return symtab;
}

/**
 * Weryfikuje każdy operand:
 *  - rejestry
 *  - liczby w dopuszczalnym zakresie
 *  - oznacza label refs do rozwiązania
 */
function validateOperands(ast) {
  const validRegs = new Set(['A', 'S', 'L', 'I', 'PC', 'IR']); // przykład
  const MAX_IMM = 0xFFFF;

  for (const node of ast) {
    if (node.type === 'Instruction') {
      for (const op of node.operands) {
        if (op.type === 'Register') {
          if (!validRegs.has(op.name)) {
            throw new Error(`Invalid register "${op.name}" at line ${node.line}`);
          }
        }
        if (op.type === 'Immediate') {
          if (op.value < 0 || op.value > MAX_IMM) {
            throw new Error(`Immediate out of range at line ${node.line}`);
          }
        }
        // LabelRef zostawiamy na później
      }
    }
  }
}

/**
 * 3rd pass: zamienia wszystkie LabelRef → Immediate(adres)
 */
function resolveLabelRefs(ast, symtab) {
  for (const node of ast) {
    if (node.type === 'Instruction') {
      node.operands = node.operands.map(op => {
        if (op.type === 'LabelRef') {
          const addr = symtab.lookup(op.name);
          return { type: 'Immediate', value: addr, line: op.line };
        }
        return op;
      });
    }
  }
}

function analyzeSemantics(ast) {
  // 1) Pierwszy przebieg: etykiety i adresowanie
  const symtab = collectLabels(ast);
  // 2) Walidacja operandów rejestrów i immediate
  validateOperands(ast);
  // 3) Rozwiązanie wszystkich odniesień do etykiet
  resolveLabelRefs(ast, symtab);
  return ast;
}

export { SymbolTable, collectLabels, validateOperands, resolveLabelRefs, analyzeSemantics };