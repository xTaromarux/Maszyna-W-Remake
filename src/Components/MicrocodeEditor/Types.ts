import type { Action, Update } from '../../Shared/Types/Common';
import type { DivProps } from '../../Shared/Types/React';
import type { FormatNumber } from '@/Shared/Types/Numbers';
import type { ReactNode } from 'react';

export interface ExecutionControlsProps extends DivProps {
  showCompilation?: boolean;
  compact?: boolean;
  manualMode: boolean;
  codeCompiled: boolean;
  code: string;
  isRunning: boolean;
  isFastRunning?: boolean;
  fastProgress?: number;
  onCompile?: Action;
  onEdit?: Action;
  onStep?: Action;
  onRun?: Action;
  onRunFast?: Action;
  onStop?: Action;
  className?: string;
}

export interface IOPanelProps extends DivProps {
  devIn?: number;
  devOut?: number;
  devReady?: number;
  wordBits: number;
  formatNumber: FormatNumber;
  onUpdateDevIn?: Update<number>;
  onUpdateDevReady?: Update<number>;
  className?: string;
}

export interface MicrocodeEditorProps extends DivProps {
  manualMode: boolean;
  codeCompiled: boolean;
  code?: string;
  compiledCode?: string[];
  activeLine: number;
  nextLine?: Set<string>;
  breakpoints?: Set<number>;
  breakpointsEnabled?: boolean;
  onUpdateCode?: Update<string>;
  onToggleBreakpoint?: Update<number>;
  chooseProgram?: ReactNode;
  children?: ReactNode;
  className?: string;
}
