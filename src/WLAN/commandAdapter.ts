import type { Phase as TemplatePhase, Signal, SignalSet, ConditionalPhase } from './instructions';

type Cmd = { name: string; args: number; description?: string; lines: string };

const KNOWN: ReadonlySet<string> = new Set([
  'czyt','wys','wei','il','wyad','wea','wyl','wel','weja','weak','przep','dod','ode','mno','dziel',
  'shr','shl','neg','lub','i','as','sa','pisz','wes','wyak','wyws','iws','wyg','werb','wyrb','wyls','dws','start',
  'readIO','writeIO','call','ret','pushAcc','popAcc'
]);

const IF_RE = /\bIF\s+([A-Za-z]+)\s+THEN\s+@([^\s;]+)\s+ELSE\s+@([^\s;]+)\b/i;
const IF_LINE_RE = /^\s*IF\s+([A-Za-z]+)\s+THEN\s+@([^\s;]+)\s+ELSE\s+@([^\s;]+)\s*$/i;

function cutKONIEC(text: string): string {
  // wycina pojedyncze słowo KONIEC (bez ;), zostawiając resztę
  return text.replace(/\bKONIEC\b/gi, '').trim();
}

function toSignalSet(line: string): SignalSet {
  const set: SignalSet = {};
  for (const tok of line.trim().split(/\s+/)) if (KNOWN.has(tok)) (set as any)[tok as Signal] = true;
  return set;
}

function toSignalArray(line: string): Signal[] {
  const out: Signal[] = [];
  for (const tok of line.trim().split(/\s+/)) if (KNOWN.has(tok)) out.push(tok as Signal);
  return out;
}

/**
 * Jeśli w danym fragmencie jest "... IF Z THEN ...", rozcinamy go na:
 *  - prefix (fazy przed IF) – jako zwykła faza
 *  - czystą linię IF ... (do dalszego parsowania)
 */
function splitChunkAtIF(chunk: string): { before?: string; ifPart?: string } {
  const m = IF_RE.exec(chunk);
  if (!m) return {};
  const idx = m.index;
  const before = chunk.slice(0, idx).trim().replace(/;+$/, ''); // usuń ewentualny średnik na końcu prefiksu
  const ifPart = chunk.slice(idx).trim().replace(/;+$/, '');
  return { before: before || undefined, ifPart };
}

/**
 * Pobiera ciało gałęzi zaczynające się od "@label ..." w danym "chunku" (po średniku).
 * Jeśli nie zaczyna się od @label, zwraca pustą listę.
 * Zwraca JEDNĄ fazę (SignalSet) – bo Twoje definicje mają ciało w jednej linii.
 */
function pickBranchBodyFromChunk(chunk: string, label: string): SignalSet[] {
  const re = new RegExp(`^@${label}\\s+(.+)$`, 'i');
  const mm = re.exec(chunk.trim());
  if (!mm) return [];
  const body = cutKONIEC(mm[1]);
  const sset = toSignalSet(body);
  // jeśli ciało nie zawiera żadnych znanych sygnałów – zwracamy pustą listę
  const any = Object.keys(sset).length > 0;
  return any ? [sset] : [];
}

type Built = { templates: Record<string, TemplatePhase[]>; postAsm: Record<string, string[]> };

export function buildFromCommandList(list: Cmd[]): Built {
  const templates: Record<string, TemplatePhase[]> = {};
  const postAsm: Record<string, string[]> = {};

  for (const cmd of (list || [])) {
    const key = (cmd.name || '').toLowerCase();
    // Rozbijamy po ';' – każdy "chunk" to jedna fraza DSL
    const rawChunks = String(cmd.lines || '')
      .split(';')
      .map(s => s.trim())
      .filter(Boolean);

    const phases: TemplatePhase[] = [];
    const extras: string[] = [];

    // Przechodzimy po chunkach – ale chunk może zawierać prefix + IF
    for (let i = 0; i < rawChunks.length; i++) {
      let ln = rawChunks[i];

      // 0) jeśli w środku wiersza mamy coś przed IF – dodajemy to jako zwykłą fazę
      const split = splitChunkAtIF(ln);
      let prefixArr: Signal[] | undefined;
      if (split.before) {
        const arr = toSignalArray(cutKONIEC(split.before));
        if (arr.length) prefixArr = arr;
      }
      if (split.ifPart) ln = split.ifPart;

      // 1) Czysta linia IF <FLAG> THEN @t ELSE @f
      if (IF_LINE_RE.test(ln)) {
        const m = IF_LINE_RE.exec(ln)!;
        const rawFlag = (m[1] || '').toUpperCase();
        // 'M' w starych materiałach = "minus" → flaga ujemności 'N'
        const flag: 'Z' | 'N' | string = (rawFlag === 'M' ? 'N' : rawFlag);
        const tLabel = m[2];
        const fLabel = m[3];

        // 2) Spodziewamy się, że kolejne dwa chunki to "@tLabel ..." oraz "@fLabel ..."
        const next1 = rawChunks[i + 1] ?? '';
        const next2 = rawChunks[i + 2] ?? '';

        const truePhases = pickBranchBodyFromChunk(next1, tLabel);
        const falsePhases = pickBranchBodyFromChunk(next2, fLabel);

        // Jeżeli nie trafiliśmy – nie przesuwamy indeksu na ślepo
        if (truePhases.length) i++;
        if (falsePhases.length) i++;

        const conditional: ConditionalPhase & { __labels?: any; __prefix?: Signal[] } = {
          conditional: true,
          flag,
          truePhases,
          falsePhases,
        };
        conditional.__labels = { t: tLabel, f: fLabel };
        if (prefixArr?.length) conditional.__prefix = prefixArr;

        phases.push(conditional);
        continue;
      }

      // 3) Linia zaczyna się od etykiety @label – faza bezwarunkowa (spoza IF)
      if (ln.startsWith('@')) {
        const body = cutKONIEC(ln.replace(/^@\S+\s+/, ''));
        const arr = toSignalArray(body);
        if (arr.length) phases.push(arr);
        continue;
      }

      // 4) STOP jako "postAsm" (np. STP na końcu)
      if (/^stop$/i.test(ln)) {
        extras.push('stop');
        continue;
      }

      // 5) Zwykła faza sygnałowa
      const arr = toSignalArray(cutKONIEC(ln));
      if (arr.length) phases.push(arr);
    }

    templates[key] = phases;
    if (extras.length) postAsm[key] = extras;
  }

  return { templates, postAsm };
}
