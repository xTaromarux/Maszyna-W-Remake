export type RuntimeCommandKind = 'exec' | 'memory' | 'directive';

export interface RuntimeCommand {
  name: string;
  mnemonics?: Record<string, string | string[]>;
  args?: number;
  argsMin?: number;
  argsMax?: number;
  kind?: RuntimeCommandKind;
  description?: string | Record<string, string>;
  lines?: string;
}

export interface NormalizedRuntimeCommand extends RuntimeCommand {
  name: string;
  kind: RuntimeCommandKind;
  argsMin: number;
  argsMax: number;
}

export interface InstructionRegistry {
  byName: Map<string, NormalizedRuntimeCommand>;
  entries: NormalizedRuntimeCommand[];
}
