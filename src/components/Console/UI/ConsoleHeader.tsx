import { useI18n } from '@/i18n';
import type { ConsoleProps } from '@/types/components';
import ConsoleIcon from './ConsoleIcon';

type Props = Pick<ConsoleProps, 'onClose' | 'onClear'> & {
  entryCount: number;
  scrollToTop: () => void;
  scrollToBottom: () => void;
};

const ConsoleHeader = ({ entryCount, scrollToTop, scrollToBottom, onClose, onClear }: Props) => {
  const { t } = useI18n();

  return (
    <div data-editor-console="" className="console-header">
      <div data-editor-console="" className="header-left">
        <div data-editor-console="" className="status-indicator" />
        <span data-editor-console="" className="console-title">
          {t('console.title')}
        </span>
      </div>
      <div data-editor-console="" className="header-center">
        <button type="button" data-editor-console="" onClick={scrollToTop} className="scroll-top-btn" title={t('console.scrollTop')}>
          <ConsoleIcon>
            <path data-editor-console="" d="M18 15l-6-6-6 6" />
          </ConsoleIcon>
        </button>
        <button
          type="button"
          data-editor-console=""
          onClick={scrollToBottom}
          className="scroll-bottom-btn"
          title={t('console.scrollBottom')}
        >
          <ConsoleIcon>
            <path data-editor-console="" d="M6 9l6 6 6-6" />
          </ConsoleIcon>
        </button>
        <button type="button" data-editor-console="" onClick={onClear} className="clear-btn" title={t('console.clear')}>
          <ConsoleIcon>
            <path data-editor-console="" d="M3 6h18" />
            <path data-editor-console="" d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path data-editor-console="" d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </ConsoleIcon>
        </button>
      </div>
      <div data-editor-console="" className="header-right">
        <span data-editor-console="" className="entry-count">
          {t('console.entryCount', { count: entryCount })}
        </span>
        <button type="button" data-editor-console="" onClick={onClose} className="close-btn" title={t('console.close')}>
          <ConsoleIcon>
            <path data-editor-console="" d="M18 6l-12 12" />
            <path data-editor-console="" d="M6 6l12 12" />
          </ConsoleIcon>
        </button>
      </div>
    </div>
  );
};

export default ConsoleHeader;
