'use client';

import { useI18n } from '@/i18n';
import type { ConsoleDockProps, SvgChildrenProps } from '@/types/components';
import Console from './Console';

function Icon({ children, fill = 'none', stroke = 'currentColor' }: SvgChildrenProps) {
  return (
    <svg data-editor-console-dock="" width="18" height="18" viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth="2">
      {children}
    </svg>
  );
}

export default function ConsoleDock({
  manualMode,
  codeCompiled,
  code = '',
  isRunning,
  isFastRunning = false,
  fastProgress = 0,
  logs = [],
  consoleOpen = true,
  hasConsoleErrors = false,
  breakpointsEnabled = true,
  onCompile,
  onEdit,
  onStep,
  onRun,
  onRunFast,
  onStop,
  onClose,
  onClear,
  onOpen,
  onUpdateBreakpointsEnabled,
  onDisableAllBreakpoints,
  onClearBreakpoints,
  className = '',
  ...rest
}: ConsoleDockProps) {
  const { t } = useI18n();
  return (
    <div data-editor-console-dock="" {...rest} className={`console-dock ${className}`}>
      {consoleOpen && (
        <aside data-editor-console-dock="" className="controls-rail">
          {!codeCompiled ? (
            <button
              data-editor-console-dock=""
              className="rail-btn"
              disabled={isRunning || !code.trim()}
              title={t('execution.compileTitle')}
              onClick={onCompile}
            >
              <Icon>
                <path
                  data-editor-console-dock=""
                  d="M3 7h18M5 7v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                />
              </Icon>
            </button>
          ) : (
            <button data-editor-console-dock="" className="rail-btn" disabled={isRunning} title={t('execution.editTitle')} onClick={onEdit}>
              <Icon>
                <path data-editor-console-dock="" d="M12 20h9" />
                <path data-editor-console-dock="" d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
              </Icon>
            </button>
          )}
          <button
            data-editor-console-dock=""
            className="rail-btn"
            disabled={isRunning || (!manualMode && !codeCompiled)}
            title={t(manualMode ? 'execution.stepManual' : 'execution.stepAuto')}
            onClick={onStep}
          >
            <Icon>
              <path data-editor-console-dock="" d="M5 3v18" />
              <path data-editor-console-dock="" d="M9 7l8 5-8 5z" />
            </Icon>
          </button>
          {!isRunning ? (
            <button
              data-editor-console-dock=""
              className="rail-btn"
              disabled={manualMode || !codeCompiled}
              title={t('execution.runTitle')}
              onClick={onRun}
            >
              <Icon fill="currentColor" stroke="none">
                <path data-editor-console-dock="" d="M8 5v14l11-7z" />
              </Icon>
            </button>
          ) : (
            <button data-editor-console-dock="" className="rail-btn" title={t('execution.stopTitle')} onClick={onStop}>
              <Icon fill="currentColor" stroke="none">
                <rect data-editor-console-dock="" x="6" y="6" width="12" height="12" rx="1" />
              </Icon>
            </button>
          )}
          {!isRunning ? (
            <button
              data-editor-console-dock=""
              className="rail-btn"
              disabled={manualMode || !codeCompiled}
              title={t('execution.runFastTitle')}
              onClick={onRunFast}
            >
              <Icon>
                <path data-editor-console-dock="" d="M5 19c.5-1.5 2-4 6-4s5.5 2.5 6 4" />
                <path data-editor-console-dock="" d="M12 3l3 3-3 9-3-9 3-3z" />
              </Icon>
            </button>
          ) : (
            isFastRunning && (
              <button
                data-editor-console-dock=""
                className="rail-btn spinning"
                title={t('execution.runningFast', { progress: fastProgress })}
                onClick={onStop}
              >
                <Icon>
                  <circle data-editor-console-dock="" cx="12" cy="12" r="9" opacity=".25" />
                  <path data-editor-console-dock="" d="M21 12a9 9 0 0 0-9-9" />
                </Icon>
              </button>
            )
          )}
          <div data-editor-console-dock="" className="divider" />
          <button
            data-editor-console-dock=""
            className={`rail-btn${breakpointsEnabled ? ' active' : ''}`}
            title={t(breakpointsEnabled ? 'consoleDock.breakpointsDisable' : 'consoleDock.breakpointsEnable')}
            onClick={() => onUpdateBreakpointsEnabled?.(!breakpointsEnabled)}
          >
            <Icon fill="currentColor" stroke="none">
              <circle data-editor-console-dock="" cx="12" cy="12" r="6" />
            </Icon>
          </button>
          <button
            data-editor-console-dock=""
            className="rail-btn"
            title={t('consoleDock.breakpointsDisableAll')}
            onClick={onDisableAllBreakpoints}
          >
            <Icon>
              <circle data-editor-console-dock="" cx="12" cy="12" r="6" />
              <path data-editor-console-dock="" d="M5 5l14 14" />
            </Icon>
          </button>
          <button
            data-editor-console-dock=""
            className="rail-btn"
            title={t('consoleDock.breakpointsClearAll')}
            onClick={onClearBreakpoints}
          >
            <Icon>
              <path data-editor-console-dock="" d="M3 6h18" />
              <path data-editor-console-dock="" d="M19 6v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <path data-editor-console-dock="" d="M10 11v6M14 11v6" />
            </Icon>
          </button>
        </aside>
      )}
      {consoleOpen && (
        <section data-editor-console-dock="" className="console-wrap">
          <Console logs={logs} onClose={onClose} onClear={onClear} />
        </section>
      )}
      {!consoleOpen && (
        <div
          data-editor-console-dock=""
          className={`console-dock-indicator${hasConsoleErrors ? ' has-errors' : ''}`}
          role="button"
          tabIndex={0}
          onClick={onOpen}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onOpen?.();
            }
          }}
          title={t('consoleDock.openConsole')}
        />
      )}
    </div>
  );
}
