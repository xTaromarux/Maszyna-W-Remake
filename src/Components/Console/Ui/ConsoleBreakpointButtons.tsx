import { useI18n } from '@/I18n/Hooks/UseI18n';
import type { ConsoleBreakpointControls } from '../Types';
import ConsoleIcon from './ConsoleIcon';
import { BreakpointGlyph, DisableBreakpointsGlyph, ClearBreakpointsGlyph } from './ConsoleGlyphs';

type Props = {
  breakpoints: ConsoleBreakpointControls & Required<Pick<ConsoleBreakpointControls, 'breakpointsEnabled'>>;
};

/** Renders the global breakpoint toggle, disable-all and clear-all actions in their original order. */
export const ConsoleBreakpointButtons = ({ breakpoints }: Props) => {
  const { breakpointsEnabled } = breakpoints;
  const { t } = useI18n();

  return (
    <>
      <button
        type="button"
        data-editor-console-dock=""
        className={`rail-btn${breakpointsEnabled ? ' active' : ''}`}
        title={t(breakpointsEnabled ? 'consoleDock.breakpointsDisable' : 'consoleDock.breakpointsEnable')}
        aria-pressed={breakpointsEnabled}
        onClick={() => breakpoints.onUpdateBreakpointsEnabled?.(!breakpointsEnabled)}
      >
        <ConsoleIcon scope="dock" size={18} fill="currentColor" stroke="none">
          <BreakpointGlyph />
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
          <DisableBreakpointsGlyph />
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
          <ClearBreakpointsGlyph />
        </ConsoleIcon>
      </button>
    </>
  );
};
