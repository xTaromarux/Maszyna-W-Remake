'use client';

import CodeMirrorEditor from '@/Components/CodeMirrorEditor/CodeMirrorEditor';
import SegmentedToggle from '@/Components/SegmentedToggle';
import { useI18n } from '@/I18n/Index';
import type { ProgramEditorProps } from '@/Types/Components';
import { useEffect, useRef } from 'react';
import IOPanel from './IoPanel';

export default function ProgramEditor({
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
}: ProgramEditorProps) {
  const { t } = useI18n();
  const compiledEl = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    compiledEl.current?.querySelector(`[data-row="${activeLine}"]`)?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  }, [activeLine, codeCompiled]);
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
      {manualMode ? (
        <div data-editor-program-editor="" className="manualModeInstruction">
          <p data-editor-program-editor="">{t('programEditor.manualInstruction')}</p>
        </div>
      ) : !codeCompiled ? (
        <CodeMirrorEditor
          modelValue={code}
          onUpdateModelValue={onUpdateCode}
          language="maszynaW"
          theme="mwTheme"
          maxHeight={showIo ? '18.3rem' : '32rem'}
        />
      ) : (
        <div data-editor-program-editor="" className={`compiledCode${breakpointsEnabled ? '' : ' bp-disabled'}`} ref={compiledEl}>
          {!breakpointsEnabled && (
            <div data-editor-program-editor="" className="bp-disabled-banner">
              {t('programEditor.breakpoints.disabled')}
            </div>
          )}
          {compiledCode.map((line, index) => (
            <span
              data-editor-program-editor=""
              key={index}
              className={`flexRow${activeLine === index ? ' active' : ''}${breakpoints.has(index) ? ' bp-line' : ''}`}
              data-row={index}
            >
              <button
                data-editor-program-editor=""
                className={`bp-dot gutter${breakpoints.has(index) ? ' bp-dot--active' : ''}`}
                disabled={!breakpointsEnabled}
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleBreakpoint?.(index);
                }}
                title={t(
                  !breakpointsEnabled
                    ? 'programEditor.breakpoints.disabled'
                    : breakpoints.has(index)
                      ? 'programEditor.breakpoints.remove'
                      : 'programEditor.breakpoints.add'
                )}
                aria-label="Toggle breakpoint"
              />
              <span data-editor-program-editor="" className="lineNo">
                {index}
              </span>
              <span data-editor-program-editor="">:</span>
              <span data-editor-program-editor="" className="codeLine">
                {line}
              </span>
            </span>
          ))}
        </div>
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
}
