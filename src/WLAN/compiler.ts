import type {
  MicroProgramEntry,
  Phase as RuntimePhase,
  MicroPhase,
} from "./model";

type Extras = {
  xRegister?: boolean;
  yRegister?: boolean;
  dl?: boolean;
  jamlExtras?: boolean;
  busConnectors?: boolean;
};

type SignalsConfig = {
  always: string[];
  xRegister: string[];
  yRegister: string[];
  dl: string[];
  jamlExtras: string[];
  busConnectors: string[];
};

export type CompileExternalOptions = {
  availableSignals: SignalsConfig;
  extras?: Extras;
};

/* =============================
   POMOCNICZE
   ============================= */
function toMicroPhaseFromSet(set: Record<string, any>): MicroPhase {
  const p: any = {};
  for (const k of Object.keys(set)) if (set[k] === true) p[k] = true;
  // zachowaj metadane mapowania linii
  if (Number.isFinite(set.srcLine)) p.srcLine = set.srcLine;
  return p as MicroPhase;
}

function tokenize(line: string): string[] {
  return line
    .split(/\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function stripLabels(tokens: string[]): { labels: string[]; rest: string[] } {
  const labels: string[] = [];
  let i = 0;
  while (i < tokens.length && tokens[i].startsWith("@")) {
    labels.push(tokens[i].slice(1));
    i++;
  }
  return { labels, rest: tokens.slice(i) };
}

function isFetchPhase(sigSet: Set<string>): boolean {
  // Nowy wpis zaczyna się od „poboru argumentu” – czytanie pamięci programu i ładowanie I, zwiększenie L
  return sigSet.has("czyt") && sigSet.has("wei") && sigSet.has("il");
}

function sigsFromTokens(
  tokens: string[],
  known: Set<string>
): Record<string, boolean> {
  const set: Record<string, boolean> = {};
  for (const t of tokens) {
    const up = t.toLowerCase();
    if (up === "koniec") break;
    if (known.has(up)) set[up] = true; // ⬅ porównanie i zapis w lowercase
  }
  return set;
}

function parseIF(tokens: string[]) {
  // IF Z THEN @zero ELSE @niezero
  if (tokens.length < 6) return null;
  if (!/^if$/i.test(tokens[0])) return null;
  const flagRaw = tokens[1]?.toUpperCase();
  const thenIdx = tokens.findIndex((t) => /^then$/i.test(t));
  const elseIdx = tokens.findIndex((t) => /^else$/i.test(t));
  if (thenIdx < 0 || elseIdx < 0) return null;
  const tTok = tokens[thenIdx + 1];
  const fTok = tokens[elseIdx + 1];
  if (!tTok || !fTok || !tTok.startsWith("@") || !fTok.startsWith("@"))
    return null;

  const flag = flagRaw === "M" || flagRaw === "NEG" ? "N" : flagRaw; // M→N
  return { flag, trueLabel: tTok.slice(1), falseLabel: fTok.slice(1) };
}

/* =============================
   GŁÓWNA FUNKCJA
   ============================= */
export function compileCodeExternal(
  source: string,
  opts: CompileExternalOptions
): { program: MicroProgramEntry[]; rawLines: string[] } {
  if (!source || !source.trim()) {
    throw new Error("Brak kodu do kompilacji.");
  }

  const { availableSignals, extras } = opts;

  // słownik sygnałów – identyczny jak w Main.vue
  const KNOWN = new Set<string>([
    ...availableSignals.always,
    ...(extras?.xRegister ? availableSignals.xRegister : []),
    ...(extras?.yRegister ? availableSignals.yRegister : []),
    ...(extras?.dl ? availableSignals.dl : []),
    ...(extras?.jamlExtras ? availableSignals.jamlExtras : []),
    ...(extras?.busConnectors ? availableSignals.busConnectors : []),
  ]);

  // surowe linie = fazy rozdzielone średnikiem
  const rawLines = source
    .split(";")
    .map((l) => l.replace(/\r?\n/g, " ").trim())
    .filter((l) => l.length > 0);

  const program: MicroProgramEntry[] = [];

  let current: MicroProgramEntry | null = null;
  const finishCurrent = () => {
    if (current && current.phases.length > 0) {
      program.push(current);
      current = null;
    }
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const tokens0 = tokenize(line);

    // Valida uproszczona (pozwala na IF / @etykiety / KONIEC)
    if (!/^if$/i.test(tokens0[0])) {
      const { rest } = stripLabels(tokens0);
      for (const tok of rest) {
        const up = tok.toUpperCase();
        if (up === "IF" || up === "THEN" || up === "ELSE" || up === "KONIEC")
          continue;
        if (!KNOWN.has(tok)) {
          // to nie sygnał – potraktujmy jako pusty tekst (np. sama etykieta)
          // ale jeśli linia nie była IF i nie ma żadnego znanego sygnału – przejdź dalej
        }
      }
    }

    // 1) IF … THEN @x ELSE @y  → ConditionalPhase w bieżącym wpisie
    const ifSpec = parseIF(tokens0);
    if (ifSpec) {
      if (!current) {
        current = {
          pc: program.length,
          asmLine: "(micro)",
          phases: [],
          meta: { kind: "NONE" },
        };
      }

      const tLine = rawLines[i + 1] ?? "";
      const fLine = rawLines[i + 2] ?? "";

      const tTok = tokenize(tLine);
      const fTok = tokenize(fLine);

      const tLbl = stripLabels(tTok);
      const fLbl = stripLabels(fTok);

      const tBodyOk =
        tLbl.labels[0]?.toLowerCase() === ifSpec.trueLabel.toLowerCase();
      const fBodyOk =
        fLbl.labels[0]?.toLowerCase() === ifSpec.falseLabel.toLowerCase();

      const tSignals = tBodyOk ? sigsFromTokens(tLbl.rest, KNOWN) : {};
      const fSignals = fBodyOk ? sigsFromTokens(fLbl.rest, KNOWN) : {};

      const condPhase: any = {
        conditional: true,
        flag: ifSpec.flag,
        truePhases: tBodyOk ? [toMicroPhaseFromSet(tSignals)] : [],
        falsePhases: fBodyOk ? [toMicroPhaseFromSet(fSignals)] : [],
        srcLine: i, // ⬅ IF
      };

      if (tBodyOk && condPhase.truePhases[0]) {
        (condPhase.truePhases[0] as any).srcLine = i + 1; // ⬅ @zero
      }
      if (fBodyOk && condPhase.falsePhases[0]) {
        (condPhase.falsePhases[0] as any).srcLine = i + 2; // ⬅ @niezero
      }

      current.phases.push(condPhase);

      if (tBodyOk) i += 1;
      if (fBodyOk) i += 1;
      continue;
    }

    // 2) Zwykła faza
    const { rest } = stripLabels(tokens0);
    const sigSet = new Set(
      rest.map((t) => t.toLowerCase()).filter((t) => KNOWN.has(t))
    );

    if (isFetchPhase(sigSet)) {
      finishCurrent();
      current = {
        pc: program.length,
        asmLine: "(micro)",
        phases: [],
        meta: { kind: "NONE" },
      };
    } else if (!current) {
      current = {
        pc: program.length,
        asmLine: "(micro)",
        phases: [],
        meta: { kind: "NONE" },
      };
    }

    if (sigSet.size === 0) continue;

    // <<< ZAMIANA: dopisujemy srcLine do zwykłej fazy >>>
    const phaseObj: any = sigsFromTokens(rest, KNOWN);
    phaseObj.srcLine = i; // przypnij numer linii
    current.phases.push(toMicroPhaseFromSet(phaseObj));

    // STOP może spokojnie kończyć wpis (ale to nie jest wymagane)
    if (phaseObj.stop) {
      // zamknij wpis – kolejne fetch’e i tak otworzą następny
      finishCurrent();
    }
  }

  // domknij ostatni wpis
  finishCurrent();

  return { program, rawLines };
}
