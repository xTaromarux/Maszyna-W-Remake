import type { TemplatePhase } from './Instructions';

export interface Built {
  templates: Record<string, TemplatePhase[]>;
  postAsm: Record<string, string[]>;
}

export interface ConditionalChunk {
  before?: string;
  ifPart?: string;
}
