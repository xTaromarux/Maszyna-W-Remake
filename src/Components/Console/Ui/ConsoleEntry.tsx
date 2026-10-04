import { ErrorLevelColor } from '@/Shared/Errors/BaseAppError';
import { useI18n } from '@/I18n/Hooks/UseI18n';
import { ErrorLevel } from '@/Shared/Errors/Types';
import type { LogEntry } from '@/Machine/Types/Machine';
import { useState } from 'react';
import { formatTimestamp, getLogLevel, hasErrorDetails } from '../Helpers/LogPresentation';
import ConsoleEntryDetails from './ConsoleEntryDetails';
import ConsoleIcon from './ConsoleIcon';

type Props = { log: LogEntry };

const ConsoleEntry = ({ log }: Props) => {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);

  const level = getLogLevel(log);
  const color = ErrorLevelColor[level] || ErrorLevelColor[ErrorLevel.INFO];
  const hasDetails = hasErrorDetails(log);
  const error = log.error || {};
  const handleHeaderClick = () => {
    if (hasDetails) {
      setExpanded((current) => !current);
    }
  };

  const toggleDetails = () => setExpanded((current) => !current);

  return (
    <div data-editor-console="" className={`console-entry level-${level.toLowerCase()}${hasDetails ? ' has-details' : ''}`}>
      <div data-editor-console="" className="entry-header" onClick={handleHeaderClick}>
        <div data-editor-console="" className="entry-meta">
          <div data-editor-console="" className="severity-indicator" style={{ backgroundColor: color }} />
          <span data-editor-console="" className="timestamp">
            {formatTimestamp(log.timestamp)}
          </span>
          <span data-editor-console="" className="level-badge" style={{ color }}>
            {level}
          </span>
        </div>
        <div data-editor-console="" className="entry-content">
          <div data-editor-console="" className="message-line">
            <span data-editor-console="" className="terminal-symbol">
              {'>_'}
            </span>
            <span data-editor-console="" className="message">
              {log.message || error.message || t('console.unknownMessage')}
            </span>
          </div>
          {hasDetails && (
            <button
              type="button"
              data-editor-console=""
              className={`details-toggle${expanded ? ' expanded' : ''}`}
              aria-expanded={expanded}
              aria-label={t('console.detailContext')}
              onClick={(event) => {
                event.stopPropagation();
                toggleDetails();
              }}
            >
              <ConsoleIcon>
                <circle data-editor-console="" cx="12" cy="12" r="10" />
                <path data-editor-console="" d="M12 16v-4" />
                <path data-editor-console="" d="M12 8h.01" />
              </ConsoleIcon>
            </button>
          )}
        </div>
      </div>
      {expanded && hasDetails && <ConsoleEntryDetails error={error} />}
    </div>
  );
};

export default ConsoleEntry;
