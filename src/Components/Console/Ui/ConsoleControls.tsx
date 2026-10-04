import { useI18n } from '@/I18n/Index';
import type { ConsoleControlsProps } from '@/Types/Components';
import ConsoleIcon from './ConsoleIcon';

const ConsoleControls = ({ execution, breakpoints }: ConsoleControlsProps) => {
  const { manualMode, codeCompiled, code = '', isRunning, isFastRunning = false, fastProgress = 0 } = execution;
  const { breakpointsEnabled = true } = breakpoints;

  const { t } = useI18n();

  const compileDisabled = isRunning || !code.trim();
  const stepDisabled = isRunning || (!manualMode && !codeCompiled);
  const runDisabled = manualMode || !codeCompiled;

  return (
    <aside data-editor-console-dock="" className="controls-rail">
      {!codeCompiled ? (
        <button
          type="button"
          data-editor-console-dock=""
          className="rail-btn"
          disabled={compileDisabled}
          title={t('execution.compileTitle')}
          onClick={execution.onCompile}
        >
          <ConsoleIcon scope="dock" size={18}>
            <path data-editor-console-dock="" d="M3 7h18M5 7v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </ConsoleIcon>
        </button>
      ) : (
        <button
          type="button"
          data-editor-console-dock=""
          className="rail-btn"
          disabled={isRunning}
          title={t('execution.editTitle')}
          onClick={execution.onEdit}
        >
          <ConsoleIcon scope="dock" size={18}>
            <path data-editor-console-dock="" d="M12 20h9" />
            <path data-editor-console-dock="" d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
          </ConsoleIcon>
        </button>
      )}
      <button
        type="button"
        data-editor-console-dock=""
        className="rail-btn"
        disabled={stepDisabled}
        title={t(manualMode ? 'execution.stepManual' : 'execution.stepAuto')}
        onClick={execution.onStep}
      >
        <ConsoleIcon scope="dock" size={18}>
          <path data-editor-console-dock="" d="M5 3v18" />
          <path data-editor-console-dock="" d="M9 7l8 5-8 5z" />
        </ConsoleIcon>
      </button>
      {!isRunning ? (
        <button
          type="button"
          data-editor-console-dock=""
          className="rail-btn"
          disabled={runDisabled}
          title={t('execution.runTitle')}
          onClick={execution.onRun}
        >
          <ConsoleIcon scope="dock" size={18} fill="currentColor" stroke="none">
            <path data-editor-console-dock="" d="M8 5v14l11-7z" />
          </ConsoleIcon>
        </button>
      ) : (
        <button type="button" data-editor-console-dock="" className="rail-btn" title={t('execution.stopTitle')} onClick={execution.onStop}>
          <ConsoleIcon scope="dock" size={18} fill="currentColor" stroke="none">
            <rect data-editor-console-dock="" x="6" y="6" width="12" height="12" rx="1" />
          </ConsoleIcon>
        </button>
      )}
      {!isRunning && (
        <button
          type="button"
          data-editor-console-dock=""
          className="rail-btn"
          disabled={runDisabled}
          title={t('execution.runFastTitle')}
          onClick={execution.onRunFast}
        >
          <ConsoleIcon scope="dock" size={18}>
            <path data-editor-console-dock="" d="M5 19c.5-1.5 2-4 6-4s5.5 2.5 6 4" />
            <path data-editor-console-dock="" d="M12 3l3 3-3 9-3-9 3-3z" />
          </ConsoleIcon>
        </button>
      )}

      {isRunning && isFastRunning && (
        <button
          type="button"
          data-editor-console-dock=""
          className="rail-btn spinning"
          title={t('execution.runningFast', { progress: fastProgress })}
          onClick={execution.onStop}
        >
          <ConsoleIcon scope="dock" size={18}>
            <circle data-editor-console-dock="" cx="12" cy="12" r="9" opacity=".25" />
            <path data-editor-console-dock="" d="M21 12a9 9 0 0 0-9-9" />
          </ConsoleIcon>
        </button>
      )}
      <div data-editor-console-dock="" className="divider" />
      <button
        type="button"
        data-editor-console-dock=""
        className={`rail-btn${breakpointsEnabled ? ' active' : ''}`}
        title={t(breakpointsEnabled ? 'consoleDock.breakpointsDisable' : 'consoleDock.breakpointsEnable')}
        aria-pressed={breakpointsEnabled}
        onClick={() => breakpoints.onUpdateBreakpointsEnabled?.(!breakpointsEnabled)}
      >
        <ConsoleIcon scope="dock" size={18} fill="currentColor" stroke="none">
          <circle data-editor-console-dock="" cx="12" cy="12" r="6" />
        </ConsoleIcon>
      </button>
      <button
        type="button"
        data-editor-console-dock=""
        className="rail-btn"
        title={t('consoleDock.breakpointsDisableAll')}
        onClick={breakpoints.onDisableAllBreakpoints}
      >
        <ConsoleIcon scope="dock" size={18}>
          <circle data-editor-console-dock="" cx="12" cy="12" r="6" />
          <path data-editor-console-dock="" d="M5 5l14 14" />
        </ConsoleIcon>
      </button>
      <button
        type="button"
        data-editor-console-dock=""
        className="rail-btn"
        title={t('consoleDock.breakpointsClearAll')}
        onClick={breakpoints.onClearBreakpoints}
      >
        <ConsoleIcon scope="dock" size={18}>
          <path data-editor-console-dock="" d="M3 6h18" />
          <path data-editor-console-dock="" d="M19 6v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          <path data-editor-console-dock="" d="M10 11v6M14 11v6" />
        </ConsoleIcon>
      </button>
    </aside>
  );
};

export default ConsoleControls;
