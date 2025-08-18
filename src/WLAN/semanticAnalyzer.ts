// semanticAnalyzer.ts – analiza semantyczna dla Maszyny W
import type { ProgramAst, AstNode, DirectiveNode } from './model';
import { WlanError, errorAt } from './error';

export class SymbolTable {
  table: Map<string, number>;

  constructor() {
    this.table = new Map();
  }

  define(name: string, address: number) {
    if (this.table.has(name)) {
      throw new WlanError(`Symbol zduplikowany: "${name}"`, { code: 'SEM_DUPLICATE_SYMBOL' });
    }
    this.table.set(name, address);
  }

  lookup(name: string): number {
    if (!this.table.has(name)) {
      throw new WlanError(`Niezdefiniowany symbol: "${name}"`, {
        code: 'SEM_UNDEFINED_SYMBOL',
        hint: 'Upewnij się, że etykieta została zdefiniowana przed użyciem lub popraw literówkę.',
      });
    }
    return this.table.get(name)!;
  }

  has(name: string) {
    return this.table.has(name);
  }
}

/**
 * Przechodzi przez AST i przypisuje adresy do etykiet
 */
export function collectLabels(nodes: AstNode[]): SymbolTable {
  const symtab = new SymbolTable();
  let currentAddress = 0;

  for (const node of nodes) {
    switch (node.type) {
      case 'Directive':
        switch ((node as DirectiveNode).name) {
          case 'ORG':
            currentAddress = (node as DirectiveNode).operands[0] as any as number;
            break;
          case 'DATA':
          case 'RST':
          case 'RPA':
            currentAddress += (node as DirectiveNode).operands.length || 1;
            break;
          case 'VECTOR_BASE':
            symtab.define('VECTOR_BASE', (node as any).operands[0].value);
            break;
        }
        break;

      case 'LabelDefinition':
        symtab.define((node as any).name, currentAddress);
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
export function validateOperands(nodes: AstNode[]) {
  const validRegs = new Set(['A', 'S', 'L', 'I', 'AK', 'PC', 'IR']);
  const MAX_IMM = 0xffff;

  for (const node of nodes) {
    const ops =
      (node as any).type === 'Conditional'
        ? [(node as any).thenBranch, ...((node as any).elseBranch ? [(node as any).elseBranch] : [])]
        : (node as any).operands;

    if (!ops) continue;

    for (const op of ops) {
      if (!op) continue;
      switch (op.type) {
        case 'Register':
          if (!validRegs.has(op.name)) {
            throw new WlanError(`Niepoprawny rejestr "${op.name}" w linii ${(node as any).line}`, {
              code: 'SEM_BAD_REGISTER',
              hint: 'Dozwolone rejestry: A, S, L, I, AK, PC, IR.',
            });
          }
          break;
        case 'Immediate':
          if (op.value < 0 || op.value > MAX_IMM) {
            throw new WlanError(`Wartość poza zakresem w linii ${(node as any).line}`, {
              code: 'SEM_IMMEDIATE_RANGE',
              hint: `Dopuszczalny zakres: 0..${MAX_IMM}.`,
            });
          }
          break;
        case 'LabelRef':
          // rozwiązywane później
          break;
        default:
          throw new WlanError(`Nieznany typ operandu "${op.type}" w linii ${(node as any).line}`, {
            code: 'SEM_UNKNOWN_OPERAND',
          });
      }
    }
  }
}

/**
 * Rozwiązanie referencji do etykiet w operandach
 */
export function resolveLabelRefs(nodes: AstNode[], symtab: SymbolTable) {
  for (const node of nodes) {
    if ((node as any).operands) {
      (node as any).operands = (node as any).operands.map((op: any) => {
        return op.type === 'LabelRef' ? { type: 'Immediate', value: symtab.lookup(op.name), line: op.line } : op;
      });
    }

    if (node.type === 'Conditional') {
      const conditionalNode = node as any;

      // Walidacja flagi warunku
      const allowedFlags = new Set(['Z', 'N']);
      if (!allowedFlags.has(conditionalNode.condition)) {
        throw new WlanError(`Nieznana flaga warunku: "${conditionalNode.condition}" w linii ${conditionalNode.line}`, {
          code: 'SEM_UNKNOWN_FLAG',
          hint: 'Dopuszczalne: Z (zero), N (negative).',
        });
      }

      // Rozwiązanie referencji do etykiet w gałęziach THEN i ELSE
      if (conditionalNode.thenBranch?.type === 'LabelRef') {
        conditionalNode.thenBranch = {
          type: 'Immediate',
          value: symtab.lookup(conditionalNode.thenBranch.name),
          line: conditionalNode.thenBranch.line,
        };
      }

      if (conditionalNode.elseBranch?.type === 'LabelRef') {
        conditionalNode.elseBranch = {
          type: 'Immediate',
          value: symtab.lookup(conditionalNode.elseBranch.name),
          line: conditionalNode.elseBranch.line,
        };
      }
    }

    if (node.type === 'Directive') {
      (node as any).operands = (node as any).operands.map((op: any) => {
        return op.type === 'LabelRef' ? { type: 'Immediate', value: symtab.lookup(op.name), line: op.line } : op;
      });
    }
  }
}

/**
 * Przetwarza dyrektywy RST, zapisując je jako początkowe przypisania do pamięci
 */
function extractInitialMemory(nodes: AstNode[], symtab: SymbolTable) {
  let lastLabel: string | null = null;

  for (const node of nodes) {
    if (node.type === 'LabelDefinition') {
      lastLabel = (node as any).name;
    }

    if (node.type === 'Directive' && ((node as any).name === 'RST' || (node as any).name === 'RPA')) {
      if (!lastLabel) {
        throw new WlanError(`RST/RPA musi być poprzedzone etykietą`, {
          code: 'SEM_RST_NEEDS_LABEL',
          hint: 'Dodaj etykietę bezpośrednio nad dyrektywą, aby określić adres inicjalizacji.',
        });
      }
      const addr = symtab.lookup(lastLabel);
      const val = (node as any).operands[0]?.value ?? 0;
      (node as any)._initMemory = { addr, val };
    } else if (node.type !== 'LabelDefinition') {
      lastLabel = null;
    }
  }
}

/**
 * Główna funkcja analizy semantycznej
 */
export function analyzeSemantics(ast: ProgramAst | AstNode[]) {
  const nodes: AstNode[] = Array.isArray(ast) ? (ast as AstNode[]) : (ast as ProgramAst).body;

  const symtab = collectLabels(nodes);
  validateOperands(nodes);
  resolveLabelRefs(nodes, symtab);
  extractInitialMemory(nodes, symtab);
  console.log('Tabela symboli:', symtab.table, nodes);

  return nodes;
}
