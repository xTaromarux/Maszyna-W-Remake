'use client';

import CompileIcon from '@/assets/svg/CompileIcon';
import EditIcon from '@/assets/svg/EditIcon';
import NextLineIcon from '@/assets/svg/NextLineIcon';
import RunIcon from '@/assets/svg/RunIcon';
import { useI18n } from '@/i18n';
import type { ExecutionControlsProps } from '@/types/components';

export default function ExecutionControls({
  manualMode,
  codeCompiled,
  code,
  isRunning,
  isFastRunning = false,
  fastProgress = 0,
  onCompile,
  onEdit,
  onStep,
  onRun,
  onRunFast,
  onStop,
  className = '',
  ...rest
}: ExecutionControlsProps) {
  const { t } = useI18n();
  return (
    <div data-editor-execution-controls="" {...rest} className={`execution-controls ${className}`}>
      {!codeCompiled ? (
        <button
          data-editor-execution-controls=""
          onClick={onCompile}
          disabled={manualMode || isRunning || !code?.trim()}
          className="execution-btn execution-btn--compile"
          title={t('execution.compileTitle')}
        >
          <CompileIcon />
          <span data-editor-execution-controls="">{t('execution.compile')} (DEBUG)</span>
        </button>
      ) : (
        <button
          data-editor-execution-controls=""
          onClick={onEdit}
          disabled={isRunning}
          className="execution-btn execution-btn--edit"
          title={t('execution.editTitle')}
        >
          <EditIcon />
          <span data-editor-execution-controls="">{t('execution.edit')}</span>
        </button>
      )}
      <button
        data-editor-execution-controls=""
        onClick={onStep}
        disabled={isRunning || (!manualMode && !codeCompiled)}
        className="execution-btn execution-btn--step"
        title={t('execution.stepTitle')}
      >
        <NextLineIcon />
        <span data-editor-execution-controls="">{t(manualMode ? 'execution.stepManual' : 'execution.stepAuto')}</span>
      </button>
      {!isRunning ? (
        <button
          data-editor-execution-controls=""
          onClick={onRun}
          disabled={manualMode || !codeCompiled}
          className="execution-btn execution-btn--run"
          title={t('execution.runTitle')}
        >
          <RunIcon />
          <span data-editor-execution-controls="">{t('execution.run')}</span>
        </button>
      ) : (
        <button
          data-editor-execution-controls=""
          onClick={onStop}
          className="execution-btn execution-btn--run"
          title={t('execution.stopTitle')}
        >
          <RunIcon />
          <span data-editor-execution-controls="">{t('execution.stop')}</span>
        </button>
      )}
      {!isRunning ? (
        <button
          data-editor-execution-controls=""
          onClick={onRunFast}
          disabled={manualMode || !codeCompiled}
          className="execution-btn execution-btn--run"
          title={t('execution.runFastTitle')}
        >
          <RunIcon />
          <span data-editor-execution-controls="">{t('execution.runFast')}</span>
        </button>
      ) : (
        isFastRunning && (
          <button
            data-editor-execution-controls=""
            onClick={onStop}
            className="execution-btn execution-btn--run"
            title={t('execution.stopTitle')}
          >
            <span data-editor-execution-controls="" className="spinner" aria-hidden="true" />
            <span data-editor-execution-controls="">{t('execution.runningFast', { progress: fastProgress })}</span>
          </button>
        )
      )}
    </div>
  );
}
