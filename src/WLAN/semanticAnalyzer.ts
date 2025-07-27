// semanticAnalyzer.js – analiza semantyczna dla Maszyny W

export class SymbolTable {
  table: any;

  constructor() {
    this.table = new Map();
  }

  define(name, address) {
    if (this.table.has(name)) {
      throw new Error(`Symbol zduplikowany: "${name}"`);
    }
    this.table.set(name, address);
  }

  lookup(name) {
    if (!this.table.has(name)) {
      throw new Error(`Niezdefiniowany symbol: "${name}"`);
    }
    return this.table.get(name);
  }

  has(name) {
    return this.table.has(name);
  }
}

/**
 * Przechodzi przez AST i przypisuje adresy do etykiet
 */
export function collectLabels(nodes) {
  const symtab = new SymbolTable();
  let currentAddress = 0;

  for (const node of nodes) {
    switch (node.type) {
      case 'Directive':
        switch (node.name) {
          case 'ORG':
            currentAddress = node.operands[0].value;
            break;
          case 'DATA':
          case 'RST':
          case 'RPA':
            currentAddress += node.operands.length || 1;
            break;
          case 'VECTOR_BASE':
            symtab.define('VECTOR_BASE', node.operands[0].value);
            break;
        }
        break;

      case 'LabelDefinition':
        symtab.define(node.name, currentAddress);
        break;

      case 'Instruction':
      case 'Conditional':
        currentAddress += 1;
        break;
    }
  }

  return symtab;
}

/**
 * Weryfikacja poprawności operandów
 */
export function validateOperands(nodes) {
  const validRegs = new Set(['A', 'S', 'L', 'I', 'AK', 'PC', 'IR']);
  const MAX_IMM = 0xffff;

  for (const node of nodes) {
    const ops = node.type === 'Conditional' ? [node.test, node.thenBranch, ...(node.elseBranch ? [node.elseBranch] : [])] : node.operands;

    if (!ops) continue;

    for (const op of ops) {
      if (!op) continue;
      switch (op.type) {
        case 'Register':
          if (!validRegs.has(op.name)) {
            throw new Error(`Niepoprawny rejestr "${op.name}" w linii ${node.line}`);
          }
          break;
        case 'Immediate':
          if (op.value < 0 || op.value > MAX_IMM) {
            throw new Error(`Wartość poza zakresem w linii ${node.line}`);
          }
          break;
        case 'LabelRef':
          // rozwiązywane później
          break;
        default:
          throw new Error(`Nieznany typ operandu "${op.type}" w linii ${node.line}`);
      }
    }
  }
}

/**
 * Rozwiązanie referencji do etykiet w operandach
 */
export function resolveLabelRefs(nodes, symtab) {
  for (const node of nodes) {
    if (node.operands) {
      node.operands = node.operands.map((op) => {
        return op.type === 'LabelRef' ? { type: 'Immediate', value: symtab.lookup(op.name), line: op.line } : op;
      });
    }

    if (node.type === 'Conditional') {
      ['test', 'thenBranch', 'elseBranch'].forEach((key) => {
        const op = node[key];
        if (op && op.type === 'LabelRef') {
          node[key] = { type: 'Immediate', value: symtab.lookup(op.name), line: op.line };
        }
      });
    }

    if (node.type === 'Directive') {
      node.operands = node.operands.map((op) => {
        return op.type === 'LabelRef' ? { type: 'Immediate', value: symtab.lookup(op.name), line: op.line } : op;
      });
    }
  }
}

/**
 * Przetwarza dyrektywy RST, zapisując je jako początkowe przypisania do pamięci
 */
function extractInitialMemory(nodes, symtab) {
  let lastLabel = null;

  for (const node of nodes) {
    if (node.type === 'LabelDefinition') {
      lastLabel = node.name;
    }

    if (node.type === 'Directive' && (node.name === 'RST' || node.name === 'RPA')) {
      if (!lastLabel) {
        throw new Error(`RST/RPA musi być poprzedzone etykietą`);
      }
      const addr = symtab.lookup(lastLabel);
      const val = node.operands[0]?.value ?? 0;
      node._initMemory = { addr, val };
    } else if (node.type !== 'LabelDefinition') {
      lastLabel = null;
    }
  }
}

/**
 * Główna funkcja analizy semantycznej
 */
export function analyzeSemantics(ast) {
  const nodes = Array.isArray(ast) ? ast : ast.body;

  const symtab = collectLabels(nodes);
  validateOperands(nodes);
  resolveLabelRefs(nodes, symtab);
  extractInitialMemory(nodes, symtab);

  return nodes;
}
