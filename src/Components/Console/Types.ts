import type { Action, Update } from '../../Shared/Types/Common';
import type { DivProps } from '../../Shared/Types/React';
import type { LogEntry } from '../../Machine/Types/Machine';

export interface ConsoleProps extends DivProps {
  logs?: LogEntry[];
  onClose?: Action;
  onClear?: Action;
  className?: string;
}

export interface ConsoleExecutionControls {
  manualMode: boolean;
  codeCompiled: boolean;
  code?: string;
  isRunning: boolean;
  isFastRunning?: boolean;
  fastProgress?: number;
  onCompile?: Action;
  onEdit?: Action;
  onStep?: Action;
  onRun?: Action;
  onRunFast?: Action;
  onStop?: Action;
}

export interface ConsoleBreakpointControls {
  breakpointsEnabled?: boolean;
  onUpdateBreakpointsEnabled?: Update<boolean>;
  onDisableAllBreakpoints?: Action;
  onClearBreakpoints?: Action;
}

export interface ConsoleControlsProps {
  execution: ConsoleExecutionControls;
  breakpoints: ConsoleBreakpointControls;
}

export interface ConsoleDockProps extends DivProps, ConsoleControlsProps {
  logs?: LogEntry[];
  consoleOpen?: boolean;
  hasConsoleErrors?: boolean;
  onClose?: Action;
  onClear?: Action;
  onOpen?: Action;
  className?: string;
}
