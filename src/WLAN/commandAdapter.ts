import type { Phase as TemplatePhase, Signal, SignalSet, ConditionalPhase } from './instructions';

type Cmd = { name: string; args: number; description?: string; lines: string };

const KNOWN: ReadonlySet<string> = new Set([
  'czyt','wys','wei','il','wyad','wea','wyl','wel','weja','weak','przep','dod','ode','mno','dziel',
  'shr','shl','neg','lub','i','as','sa','pisz','wes','wyak','wyws','iws','wyg','werb','wyrb','wyls','dws',
  'readIO','writeIO','call','ret','pushAcc','popAcc'
]);

function lineToSignalSet(line: string): SignalSet {
  const set: SignalSet = {};
  for (const tok of line.trim().split(/\s+/)) if (KNOWN.has(tok)) (set as any)[tok as Signal] = true;
  return set;
}
function lineToSignalArray(line: string): Signal[] {
  const out: Signal[] = [];
  for (const tok of line.trim().split(/\s+/)) if (KNOWN.has(tok)) out.push(tok as Signal);
  return out;
}

type Built = { templates: Record<string, TemplatePhase[]>; postAsm: Record<string, string[]> };

export function buildFromCommandList(list: Cmd[]): Built {
  const templates: Record<string, TemplatePhase[]> = {};
  const postAsm: Record<string, string[]> = {};

  for (const cmd of (list || [])) {
    const key = (cmd.name || '').toLowerCase();
    const chunks = String(cmd.lines || '').split(';').map(s => s.trim()).filter(Boolean);

    const phases: TemplatePhase[] = [];
    const extras: string[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const ln = chunks[i];

      // IF <FLAG> THEN @t ELSE @f
      const m = /^IF\s+([A-Za-z]+)\s+THEN\s+@([^\s]+)\s+ELSE\s+@([^\s]+)$/i.exec(ln);
      if (m) {
        const rawFlag = m[1].toUpperCase();
        const flag: 'Z'|'N'|string = (rawFlag === 'M' ? 'N' : rawFlag);
        const tLabel = m[2], fLabel = m[3];

        const pick = (label: string): SignalSet[] => {
          const next = chunks[++i] ?? '';
          const re = new RegExp(`^@${label}\\s+(.+)$`, 'i');
          const mm = re.exec(next);
          const body = (mm?.[1] ?? '').replace(/\bKONIEC\b/i, '').trim();
          return [lineToSignalSet(body)];
        };

        const conditional: ConditionalPhase = {
          conditional: true,
          flag,
          truePhases: pick(tLabel),
          falsePhases: pick(fLabel),
        };
        phases.push(conditional);
        continue;
      }

      if (ln.startsWith('@')) {
        const body = ln.replace(/^@\S+\s+/, '').replace(/\bKONIEC\b/i, '').trim();
        const arr = lineToSignalArray(body);
        if (arr.length) phases.push(arr);
        continue;
      }

      if (/^stop$/i.test(ln)) { extras.push('stop'); continue; }

      const arr = lineToSignalArray(ln);
      if (arr.length) phases.push(arr);
    }

    templates[key] = phases;
    if (extras.length) postAsm[key] = extras;
  }

  return { templates, postAsm };
}
