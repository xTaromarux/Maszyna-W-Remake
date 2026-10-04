import type { Phase as TemplatePhase } from './instructions';

export interface Built {
  templates: Record<string, TemplatePhase[]>;
  postAsm: Record<string, string[]>;
}

export interface ConditionalChunk {
  before?: string;
  ifPart?: string;
}
