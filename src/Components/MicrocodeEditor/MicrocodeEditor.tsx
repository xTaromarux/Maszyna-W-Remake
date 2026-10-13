'use client';

import CodeMirrorEditor from '@/Editor/CodeMirrorEditor/CodeMirrorEditor';
import SegmentedToggle from '@/Shared/Ui/SegmentedToggle/SegmentedToggle';
import { useI18n } from '@/I18n/Hooks/UseI18n';
import type { MicrocodeEditorProps } from '@/Components/MicrocodeEditor/Types';
import IOPanel from './Ui/IoPanel';
import CompiledProgramView from './Ui/CompiledProgramView';

const MicrocodeEditor = ({
  manualMode,
  codeCompiled,
  code = '',
  compiledCode = [],
  activeLine,
  nextLine = new Set(),
  breakpoints = new Set(),
  breakpointsEnabled = true,
  showIo = false,
  devIn = 0,
  devOut = 0,
  devReady = 1,
  wordBits,
  formatNumber,
  onUpdateCode,
  onSetManualMode,
  onUpdateDevIn,
  onUpdateDevReady,
  onToggleBreakpoint,
  chooseProgram,
  children,
  className = '',
  ...rest
}: MicrocodeEditorProps) => {
  const { t } = useI18n();

  const showSourceEditor = !manualMode && !codeCompiled;
  const showCompiledProgram = !manualMode && codeCompiled;

  return (
    <div data-editor-program-editor="" {...rest} className={`programEditor ${className}`}>
      <SegmentedToggle
        data-editor-program-editor=""
        options={[
          { label: t('programEditor.modeToggle.manual'), value: true },
          { label: t('programEditor.modeToggle.program'), value: false },
        ]}
        modelValue={manualMode}
        onUpdateModelValue={onSetManualMode}
        className="toggleButtonProgram"
      />
      {showIo && (
        <IOPanel
          devIn={devIn}
          devOut={devOut}
          devReady={devReady}
          wordBits={wordBits}
          formatNumber={formatNumber}
          onUpdateDevIn={onUpdateDevIn}
          onUpdateDevReady={onUpdateDevReady}
          className="mb-2"
        />
      )}
      <div data-editor-program-editor="" className="chooseProgram">
        {chooseProgram ?? children}
      </div>
      {manualMode && (
        <div data-editor-program-editor="" className="manualModeInstruction">
          <p data-editor-program-editor="">{t('programEditor.manualInstruction')}</p>
        </div>
      )}
      {showSourceEditor && (
        <CodeMirrorEditor
          modelValue={code}
          onUpdateModelValue={onUpdateCode}
          language="maszynaW"
          theme="mwTheme"
          maxHeight={showIo ? '18.3rem' : '32rem'}
        />
      )}
      {showCompiledProgram && (
        <CompiledProgramView
          compiledCode={compiledCode}
          activeLine={activeLine}
          breakpoints={breakpoints}
          breakpointsEnabled={breakpointsEnabled}
          onToggleBreakpoint={onToggleBreakpoint}
        />
      )}
      {manualMode && (
        <div data-editor-program-editor="" className="nextLine">
          <p data-editor-program-editor="" className="nextLineTitle">
            {t('programEditor.nextLineTitle')}
          </p>
          <div data-editor-program-editor="" className="flexRow">
            {[...nextLine].map((command) => (
              <div data-editor-program-editor="" key={command}>
                <span data-editor-program-editor="">{command}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MicrocodeEditor;
