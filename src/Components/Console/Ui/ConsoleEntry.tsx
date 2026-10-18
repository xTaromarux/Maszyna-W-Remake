import { useI18n } from '@/I18n/Hooks/UseI18n';
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
          <span data-editor-console="" className="timestamp">
            {formatTimestamp(log.timestamp)}
          </span>
          <span data-editor-console="" className="level-badge">
            {level}
          </span>
        </div>
        <div data-editor-console="" className="entry-content">
          <span data-editor-console="" className="message">
            {log.message || error.message || t('console.unknownMessage')}
          </span>
          {hasDetails && (
            <button
              type="button"
              data-editor-console=""
              className={`details-toggle${expanded ? ' expanded' : ''}`}
              aria-expanded={expanded}
              aria-label={t('console.toggleDetails')}
              onClick={(event) => {
                event.stopPropagation();
                toggleDetails();
              }}
            >
              <ConsoleIcon>
                <path data-editor-console="" d="m6 9 6 6 6-6" />
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
