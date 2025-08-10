import type { AstNode } from './model';
import { instructionTemplates } from './instructions';
import type { Phase as TemplatePhase, Signal, SignalSet } from './instructions';
import type { MicroProgramEntry, MicroPhase, Phase as RuntimePhase } from './model';
import { WlanError } from './error';

function toMicroPhaseFromSignals(signals: Signal[]): MicroPhase {
  const phase: MicroPhase = {};
  for (const s of signals) phase[s] = true;
  return phase;
}
function toMicroPhaseFromSignalSet(set: SignalSet): MicroPhase {
  const phase: MicroPhase = {};
  for (const k in set) if (set[k]) (phase as any)[k] = true;
  return phase;
}
function normalizeMnemonic(name: string): string {
  const upper = name.toUpperCase();
  if (upper === 'STOP') return 'STP';
  if (upper === 'WPR') return 'wpr';
  return upper;
}

export function generateMicroProgram(ast: AstNode[]): MicroProgramEntry[] {
  // PASS 1 — nazwij instrukcje pc i zbuduj mapę address→pc
  let currentAddr = 0; // adres w pamięci (kod+dane)
  let pc = 0; // indeks instrukcji
  const addrToPc = new Map<number, number>();
  const instrNodes: any[] = []; // pc → Instruction node

  for (const node of ast) {
    switch (node.type) {
      case 'Directive': {
        const name = (node as any).name?.toUpperCase();
        if (name === 'RST' || name === 'RPA' || name === 'DATA') {
          currentAddr += Math.max(1, (node as any).operands?.length ?? 1);
        } else if (name === 'ORG') {
          currentAddr = (node as any).operands?.[0]?.value ?? currentAddr;
        }
        break;
      }
      case 'Instruction': {
        addrToPc.set(currentAddr, pc);
        instrNodes[pc] = node;
        currentAddr += 1;
        pc += 1;
        break;
      }
      // LabelDefinition nie zmienia currentAddr (oznacza „następny adres”)
      default:
        break;
    }
  }

  // PASS 2 — buduj wpisy (pc, phases) + meta skoków
  const program: MicroProgramEntry[] = [];

  for (let i = 0; i < instrNodes.length; i++) {
    const node = instrNodes[i];
    const name = normalizeMnemonic(node.name || '');
    const template = instructionTemplates[name as keyof typeof instructionTemplates];
    if (!template) {
      throw new WlanError(`Brak szablonu mikroprogramu dla instrukcji "${(node.name || '').toUpperCase()}"`, {
        code: 'GEN_NO_TEMPLATE',
        hint: 'Upewnij się, że nazwa instrukcji jest poprawna lub dodaj odpowiedni szablon.',
      });
    }

    const asmLine =
      `${(node.name || '').toUpperCase()}` +
      `${node.operands?.length ? ' ' + node.operands.map((op: any) => op.name ?? op.value).join(', ') : ''}`;

    const phases: RuntimePhase[] = template.map((tplPhase: TemplatePhase) => {
      if (Array.isArray(tplPhase)) return toMicroPhaseFromSignals(tplPhase);
      // mapuj ewentualne 'M'→'N' jeśli szablony jeszcze używają 'M'
      const flag = (tplPhase.flag === 'M' ? 'N' : tplPhase.flag) as 'Z' | 'N' | string;
      return {
        conditional: true,
        flag,
        truePhases: tplPhase.truePhases.map(toMicroPhaseFromSignalSet),
        falsePhases: tplPhase.falsePhases.map(toMicroPhaseFromSignalSet),
      } as RuntimePhase;
    });

    // meta (opcjonalna) dla egzekutora
    const meta: MicroProgramEntry['meta'] = { kind: 'NONE' };

    if (name === 'SOB') {
      const targetAddr = node.operands?.[0]?.value;
      if (typeof targetAddr !== 'number')
        throw new WlanError(`SOB bez rozwiązanego adresu (po resolveLabelRefs)`, { code: 'GEN_SOB_NO_ADDR' });
      const targetPc = addrToPc.get(targetAddr);
      if (targetPc === undefined) throw new WlanError(`SOB → adres ${targetAddr} nie wskazuje instrukcji`, { code: 'GEN_SOB_BAD_ADDR' });
      meta.kind = 'JUMP';
      meta.trueTarget = targetPc;
    } else if (name === 'SOZ' || name === 'SOM') {
      const targetAddr = node.operands?.[0]?.value;
      if (typeof targetAddr !== 'number')
        throw new WlanError(`${name} bez rozwiązanego adresu (po resolveLabelRefs)`, { code: 'GEN_CJUMP_NO_ADDR' });
      const targetPc = addrToPc.get(targetAddr);
      if (targetPc === undefined)
        throw new WlanError(`${name} → adres ${targetAddr} nie wskazuje instrukcji`, { code: 'GEN_CJUMP_BAD_ADDR' });
      meta.kind = 'CJUMP';
      meta.flag = name === 'SOZ' ? 'Z' : 'N';
      meta.trueTarget = targetPc;
      meta.falseTarget = i + 1; // fallthrough
    }

    program.push({ pc: i, asmLine, phases, meta });
  }

  // console.log(
  //   'Generated microprogram:',
  //   program,
  //   program.map((e) => `${e.pc}: ${e.asmLine}`)
  // );
  return program;
}
