'use client';

import { useI18n } from '@/I18n/Hooks/UseI18n';
import type { ConsoleDockProps } from '@/Components/Console/Types';
import Console from './Console';
import ConsoleControls from './Ui/ConsoleControls';

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
      {consoleOpen && (
        <section data-editor-console-dock="" className="console-wrap">
          <Console
            logs={logs}
            onClose={onClose}
            onClear={onClear}
            controls={<ConsoleControls execution={execution} breakpoints={breakpoints} />}
          />
        </section>
      )}
      {!consoleOpen && (
        <button
          data-editor-console-dock=""
          type="button"
          className={`console-dock-indicator console-indicator${hasConsoleErrors ? ' has-errors' : ''}`}
          onClick={onOpen}
          title={t('consoleDock.openConsole')}
          aria-label={t('consoleDock.openConsole')}
        />
      )}
    </div>
  );
};

export default ConsoleDock;
