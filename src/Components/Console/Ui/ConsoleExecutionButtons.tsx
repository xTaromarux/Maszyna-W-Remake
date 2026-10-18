import { useI18n } from '@/I18n/Hooks/UseI18n';
import type { ConsoleExecutionControls } from '../Types';
import ConsoleIcon from './ConsoleIcon';
import { CompileGlyph, EditGlyph, StepGlyph, RunGlyph, StopGlyph, FastRunGlyph, FastProgressGlyph } from './ConsoleGlyphs';

type Props = {
  execution: ConsoleExecutionControls & Required<Pick<ConsoleExecutionControls, 'code' | 'isFastRunning' | 'fastProgress'>>;
};

/** Renders execution actions with their manual-mode and running-state policies. */
export const ConsoleExecutionButtons = ({ execution }: Props) => {
  const { manualMode, codeCompiled, code, isRunning, isFastRunning, fastProgress } = execution;
  const { t } = useI18n();
  const compileDisabled = manualMode || isRunning || !code.trim();
  const stepDisabled = isRunning || (!manualMode && !codeCompiled);
  const runDisabled = manualMode || !codeCompiled;

  return (
    <>
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
            <CompileGlyph />
          </ConsoleIcon>
          <span>{t('execution.compile')} (DEBUG)</span>
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
            <EditGlyph />
          </ConsoleIcon>
          <span>{t('execution.edit')}</span>
        </button>
      )}
      <button
        type="button"
        data-editor-console-dock=""
        className="rail-btn rail-btn--step"
        disabled={stepDisabled}
        title={t(manualMode ? 'execution.stepManual' : 'execution.stepAuto')}
        onClick={execution.onStep}
      >
        <ConsoleIcon scope="dock" size={18}>
          <StepGlyph />
        </ConsoleIcon>
        <span>{t(manualMode ? 'execution.stepManual' : 'execution.stepAuto')}</span>
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
            <RunGlyph />
          </ConsoleIcon>
          <span>{t('execution.run')}</span>
        </button>
      ) : (
        <button type="button" data-editor-console-dock="" className="rail-btn" title={t('execution.stopTitle')} onClick={execution.onStop}>
          <ConsoleIcon scope="dock" size={18} fill="currentColor" stroke="none">
            <StopGlyph />
          </ConsoleIcon>
          <span>{t('execution.stop')}</span>
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
            <FastRunGlyph />
          </ConsoleIcon>
          <span>{t('execution.runFast')}</span>
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
            <FastProgressGlyph />
          </ConsoleIcon>
        </button>
      )}
    </>
  );
};
