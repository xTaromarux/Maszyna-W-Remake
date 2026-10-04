'use client';

import CompileIcon from '@/Assets/Svg/CompileIcon';
import EditIcon from '@/Assets/Svg/EditIcon';
import NextLineIcon from '@/Assets/Svg/NextLineIcon';
import RunIcon from '@/Assets/Svg/RunIcon';
import { useI18n } from '@/I18n/Index';
import type { ExecutionControlsProps } from '@/Types/Components';

const ExecutionControls = ({
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
}: ExecutionControlsProps) => {
  const { t } = useI18n();
  const canCompile = !manualMode && !isRunning && Boolean(code?.trim());
  const canStep = !isRunning && (manualMode || codeCompiled);
  const canRun = !manualMode && codeCompiled;
  const showFastProgress = isRunning && isFastRunning;
  const compileAction = codeCompiled ? 'edit' : 'compile';
  const runAction = isRunning ? 'stop' : 'run';

  return (
    <div data-editor-execution-controls="" {...rest} className={`execution-controls ${className}`}>
      <button
        type="button"
        data-editor-execution-controls=""
        onClick={codeCompiled ? onEdit : onCompile}
        disabled={codeCompiled ? isRunning : !canCompile}
        className={`execution-btn execution-btn--${compileAction}`}
        title={t(`execution.${compileAction}Title`)}
      >
        {codeCompiled ? <EditIcon /> : <CompileIcon />}
        <span data-editor-execution-controls="">
          {t(`execution.${compileAction}`)}
          {!codeCompiled && ' (DEBUG)'}
        </span>
      </button>
      <button
        type="button"
        data-editor-execution-controls=""
        onClick={onStep}
        disabled={!canStep}
        className="execution-btn execution-btn--step"
        title={t('execution.stepTitle')}
      >
        <NextLineIcon />
        <span data-editor-execution-controls="">{t(manualMode ? 'execution.stepManual' : 'execution.stepAuto')}</span>
      </button>
      <button
        type="button"
        data-editor-execution-controls=""
        onClick={isRunning ? onStop : onRun}
        disabled={!isRunning && !canRun}
        className="execution-btn execution-btn--run"
        title={t(`execution.${runAction}Title`)}
      >
        <RunIcon />
        <span data-editor-execution-controls="">{t(`execution.${runAction}`)}</span>
      </button>
      {!isRunning && (
        <button
          type="button"
          data-editor-execution-controls=""
          onClick={onRunFast}
          disabled={!canRun}
          className="execution-btn execution-btn--run"
          title={t('execution.runFastTitle')}
        >
          <RunIcon />
          <span data-editor-execution-controls="">{t('execution.runFast')}</span>
        </button>
      )}
      {showFastProgress && (
        <button
          type="button"
          data-editor-execution-controls=""
          onClick={onStop}
          className="execution-btn execution-btn--run"
          title={t('execution.stopTitle')}
        >
          <span data-editor-execution-controls="" className="spinner" aria-hidden="true" />
          <span data-editor-execution-controls="">{t('execution.runningFast', { progress: fastProgress })}</span>
        </button>
      )}
    </div>
  );
};

export default ExecutionControls;
