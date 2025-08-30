// WLAN/microGenerator.ts
import type { AstNode } from './model';
import { buildFromCommandList } from './commandAdapter';
import type { Phase as TemplatePhase, Signal, SignalSet } from './instructions';
import type { MicroProgramEntry, MicroPhase, Phase as RuntimePhase } from './model';
import { WlanError } from './error';

function toMicroPhaseFromSignals(signals: Signal[]): MicroPhase {
  const phase: MicroPhase = {}; for (const s of signals) phase[s] = true; return phase;
}
function toMicroPhaseFromSignalSet(set: SignalSet): MicroPhase {
  const phase: MicroPhase = {}; for (const k in set) if (set[k]) (phase as any)[k] = true; return phase;
}
const nameKey = (n: string) => (n || '').toLowerCase();

export function generateMicroProgram(ast: AstNode[], commandList: Array<{name:string;args:number;description?:string;lines:string}>): MicroProgramEntry[] {
  if (!Array.isArray(commandList) || commandList.length === 0) {
    throw new WlanError('Pusta lista rozkazów – brak definicji do generowania mikroprogramu.', { code: 'GEN_EMPTY_CMDLIST' });
  }

  // ZBUDUJ TEMPLATES + POSTASM z AKTUALNEJ listy
  const { templates: TEMPLATES, postAsm: POSTASM } = buildFromCommandList(commandList);

  // PASS 1 — adresowanie
  let currentAddr = 0, pc = 0;
  const addrToPc = new Map<number, number>();
  const instrNodes: any[] = [];
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
      case 'Instruction':
        addrToPc.set(currentAddr, pc);
        instrNodes[pc] = node;
        currentAddr += 1; pc += 1;
        break;
      default: break;
    }
  }

  // PASS 2 — budowa programu
  const program: MicroProgramEntry[] = [];

  for (let i = 0; i < instrNodes.length; i++) {
    const node = instrNodes[i];
    const key = nameKey(node.name || '');
    const template = TEMPLATES[key];

    if (!template) {
      throw new WlanError(`Brak definicji w commandList dla instrukcji "${(node.name || '').toUpperCase()}"`, {
        code: 'GEN_NO_TEMPLATE',
        hint: 'Sprawdź nazwę rozkazu w edytorze listy rozkazów lub dodaj wpis.',
      });
    }

    const asmLine =
      `${(node.name || '').toUpperCase()}` +
      `${node.operands?.length ? ' ' + node.operands.map((op: any) => op.name ?? op.value).join(', ') : ''}`;

    const phases: RuntimePhase[] = template.map((tplPhase: TemplatePhase) => {
      if (Array.isArray(tplPhase)) return toMicroPhaseFromSignals(tplPhase as any);
      if ((tplPhase as any).conditional === true) {
        const flag = ((tplPhase as any).flag === 'M' ? 'N' : (tplPhase as any).flag) as 'Z'|'N'|string;
        return {
          conditional: true,
          flag,
          truePhases: (tplPhase as any).truePhases.map(toMicroPhaseFromSignalSet),
          falsePhases: (tplPhase as any).falsePhases.map(toMicroPhaseFromSignalSet),
        } as RuntimePhase;
      }
      // Gdyby gdzieś pojawił się zwykły SignalSet:
      return toMicroPhaseFromSignalSet(tplPhase as any);
    });

    const meta: MicroProgramEntry['meta'] = { kind: 'NONE' } as any;

    const upper = (node.name || '').toUpperCase();
    if (upper === 'SOB') {
      const targetAddr = node.operands?.[0]?.value;
      if (typeof targetAddr !== 'number') throw new WlanError(`SOB bez adresu`, { code: 'GEN_SOB_NO_ADDR' });
      const targetPc = addrToPc.get(targetAddr);
      if (targetPc === undefined) throw new WlanError(`SOB -> ${targetAddr} nie wskazuje instrukcji`, { code: 'GEN_SOB_BAD_ADDR' });
      (meta as any).kind = 'JUMP';
      (meta as any).trueTarget = targetPc;
    } else if (upper === 'SOZ' || upper === 'SOM') {
      const targetAddr = node.operands?.[0]?.value;
      if (typeof targetAddr !== 'number') throw new WlanError(`${upper} bez adresu`, { code: 'GEN_CJUMP_NO_ADDR' });
      const targetPc = addrToPc.get(targetAddr);
      if (targetPc === undefined) throw new WlanError(`${upper} -> ${targetAddr} nie wskazuje instrukcji`, { code: 'GEN_CJUMP_BAD_ADDR' });
      (meta as any).kind = 'CJUMP';
      (meta as any).flag = (upper === 'SOZ' ? 'Z' : 'N');
      (meta as any).trueTarget = targetPc;
      (meta as any).falseTarget = i + 1;
    }

    const extra = POSTASM[key];
    if (extra?.length) (meta as any).postAsm = extra.slice();

    program.push({ pc: i, asmLine, phases, meta });
  }

  return program;
}
