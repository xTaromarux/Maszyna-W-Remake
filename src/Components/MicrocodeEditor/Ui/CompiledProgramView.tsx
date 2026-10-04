import { useI18n } from '@/I18n/Hooks/UseI18n';
import type { MicrocodeEditorProps } from '@/Components/MicrocodeEditor/Types';
import type { MouseEvent } from 'react';
import { useCompiledLineScroll } from '../Hooks/UseCompiledLineScroll';

type CompiledProgramViewProps = Pick<
  MicrocodeEditorProps,
  'compiledCode' | 'activeLine' | 'breakpoints' | 'breakpointsEnabled' | 'onToggleBreakpoint'
>;

type CompiledProgramRowProps = {
  line: string;
  index: number;
  active: boolean;
  hasBreakpoint: boolean;
  breakpointsEnabled: boolean;
  onToggleBreakpoint: MicrocodeEditorProps['onToggleBreakpoint'];
};

const CompiledProgramRow = ({ line, index, active, hasBreakpoint, breakpointsEnabled, onToggleBreakpoint }: CompiledProgramRowProps) => {
  const { t } = useI18n();

  let breakpointLabel = t('programEditor.breakpoints.disabled');
  if (breakpointsEnabled) {
    breakpointLabel = t(hasBreakpoint ? 'programEditor.breakpoints.remove' : 'programEditor.breakpoints.add');
  }

  const toggleBreakpoint = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onToggleBreakpoint?.(index);
  };

  const rowClassName = ['flexRow', active && 'active', hasBreakpoint && 'bp-line'].filter(Boolean).join(' ');

  return (
    <span data-editor-program-editor="" className={rowClassName} data-row={index}>
      <button
        data-editor-program-editor=""
        type="button"
        className={`bp-dot gutter${hasBreakpoint ? ' bp-dot--active' : ''}`}
        disabled={!breakpointsEnabled}
        onClick={toggleBreakpoint}
        title={breakpointLabel}
        aria-label={breakpointLabel}
      />
      <span data-editor-program-editor="" className="lineNo">
        {index}
      </span>
      <span data-editor-program-editor="">:</span>
      <span data-editor-program-editor="" className="codeLine">
        {line}
      </span>
    </span>
  );
};

const CompiledProgramView = ({
  compiledCode = [],
  activeLine,
  breakpoints = new Set(),
  breakpointsEnabled = true,
  onToggleBreakpoint,
}: CompiledProgramViewProps) => {
  const { t } = useI18n();
  const compiledView = useCompiledLineScroll(activeLine);

  return (
    <div data-editor-program-editor="" className={`compiledCode${breakpointsEnabled ? '' : ' bp-disabled'}`} ref={compiledView}>
      {!breakpointsEnabled && (
        <div data-editor-program-editor="" className="bp-disabled-banner">
          {t('programEditor.breakpoints.disabled')}
        </div>
      )}
      {compiledCode.map((line, index) => (
        <CompiledProgramRow
          key={index}
          line={line}
          index={index}
          active={activeLine === index}
          hasBreakpoint={breakpoints.has(index)}
          breakpointsEnabled={breakpointsEnabled}
          onToggleBreakpoint={onToggleBreakpoint}
        />
      ))}
    </div>
  );
};

export default CompiledProgramView;
