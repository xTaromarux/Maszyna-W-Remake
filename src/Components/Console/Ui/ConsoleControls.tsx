import type { ConsoleControlsProps } from '@/Components/Console/Types';
import { ConsoleExecutionButtons } from './ConsoleExecutionButtons';
import { ConsoleBreakpointButtons } from './ConsoleBreakpointButtons';

/** Composes the execution and breakpoint groups while preserving the console rail's defaults. */
const ConsoleControls = ({ execution, breakpoints }: ConsoleControlsProps) => {
  const { code = '', isFastRunning = false, fastProgress = 0 } = execution;
  const { breakpointsEnabled = true } = breakpoints;

  return (
    <aside data-editor-console-dock="" className="controls-rail">
      <ConsoleExecutionButtons execution={{ ...execution, code, isFastRunning, fastProgress }} />
      <div data-editor-console-dock="" className="divider" />
      <ConsoleBreakpointButtons breakpoints={{ ...breakpoints, breakpointsEnabled }} />
    </aside>
  );
};

export default ConsoleControls;
