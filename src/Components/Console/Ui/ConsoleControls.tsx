import type { ConsoleControlsProps } from '@/Components/Console/Types';
import { ConsoleExecutionButtons } from './ConsoleExecutionButtons';
import { ConsoleBreakpointButtons } from './ConsoleBreakpointButtons';
import { useI18n } from '@/I18n/Hooks/UseI18n';

/** Keeps execution and breakpoint controls together in the console toolbar. */
const ConsoleControls = ({ execution, breakpoints }: ConsoleControlsProps) => {
  const { t } = useI18n();
  const { code = '', isFastRunning = false, fastProgress = 0 } = execution;
  const { breakpointsEnabled = true } = breakpoints;

  return (
    <div data-editor-console-dock="" className="controls-rail" role="group" aria-label={t('console.executionControls')}>
      <div className="console-control-group">
        <ConsoleExecutionButtons execution={{ ...execution, code, isFastRunning, fastProgress }} />
      </div>
      <div data-editor-console-dock="" className="divider" />
      <div className="console-control-group">
        <ConsoleBreakpointButtons breakpoints={{ ...breakpoints, breakpointsEnabled }} />
      </div>
    </div>
  );
};

export default ConsoleControls;
