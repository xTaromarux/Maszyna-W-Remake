'use client';

import { useI18n } from '@/i18n';
import type { ConsoleDockProps } from '@/types/components';
import Console from './Console';
import ConsoleControls from './UI/ConsoleControls';

const ConsoleDock = ({
  execution,
  breakpoints,
  logs = [],
  consoleOpen = true,
  hasConsoleErrors = false,
  onClose,
  onClear,
  onOpen,
  className = '',
  ...rest
}: ConsoleDockProps) => {
  const { t } = useI18n();
  return (
    <div data-editor-console-dock="" {...rest} className={`console-dock ${className}`}>
      {consoleOpen && <ConsoleControls execution={execution} breakpoints={breakpoints} />}
      {consoleOpen && (
        <section data-editor-console-dock="" className="console-wrap">
          <Console logs={logs} onClose={onClose} onClear={onClear} />
        </section>
      )}
      {!consoleOpen && (
        <button
          data-editor-console-dock=""
          type="button"
          className={`console-dock-indicator${hasConsoleErrors ? ' has-errors' : ''}`}
          onClick={onOpen}
          title={t('consoleDock.openConsole')}
          aria-label={t('consoleDock.openConsole')}
        />
      )}
    </div>
  );
};

export default ConsoleDock;
