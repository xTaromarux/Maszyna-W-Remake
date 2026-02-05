import type { Phase as TemplatePhase } from './instructions';

export interface Cmd {
  name: string;
  args: number;
  description?: string | Record<string, string>;
  lines: string;
}

export interface Built {
  templates: Record<string, TemplatePhase[]>;
  postAsm: Record<string, string[]>;
}
