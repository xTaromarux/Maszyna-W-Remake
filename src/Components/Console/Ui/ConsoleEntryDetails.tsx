import { useI18n } from '@/I18n/Hooks/UseI18n';
import type { LogError } from '@/Machine/Types/Machine';

type Props = { error: LogError };

const ConsoleEntryDetails = ({ error }: Props) => {
  const { t } = useI18n();

  return (
    <div data-editor-console="" className="entry-details">
      <div data-editor-console="" className="details-content">
        {error.code && (
          <div data-editor-console="" className="detail-section">
            <span data-editor-console="" className="detail-label">
              {t('console.detailCode')}
            </span>
            <code data-editor-console="" className="detail-value">
              {error.code}
            </code>
          </div>
        )}
        {error.hint && (
          <div data-editor-console="" className="detail-section">
            <span data-editor-console="" className="detail-label">
              {t('console.detailHint')}
            </span>
            <div data-editor-console="" className="detail-value hint-text">
              {error.hint}
            </div>
          </div>
        )}
        {error.loc && (
          <div data-editor-console="" className="detail-section">
            <span data-editor-console="" className="detail-label">
              {t('console.detailLocation')}
            </span>
            <code data-editor-console="" className="detail-value">
              {t('console.locationValue', { line: error.loc.line, column: error.loc.col })}
            </code>
          </div>
        )}
        {error.frame && (
          <div data-editor-console="" className="detail-section code-frame">
            <span data-editor-console="" className="detail-label">
              {t('console.detailContext')}
            </span>
            <pre data-editor-console="" className="detail-value code-block">
              {error.frame}
            </pre>
          </div>
        )}
        {error.timestamp && (
          <div data-editor-console="" className="detail-section">
            <span data-editor-console="" className="detail-label">
              {t('console.detailOccurred')}
            </span>
            <span data-editor-console="" className="detail-value">
              {new Date(error.timestamp).toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsoleEntryDetails;
