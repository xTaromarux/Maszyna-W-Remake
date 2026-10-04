import { useI18n } from '@/I18n/Index';
import type { CodeBlockProps } from '@/Types/Components';
import { useEffect, useState } from 'react';
import { copyToClipboard } from '../Helpers/Clipboard';

const COPY_FEEDBACK_DURATION_MS = 1200;

const CodeBlock = ({ code, language }: CodeBlockProps) => {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const resetCopyFeedback = () => setCopied(false);
    const feedbackTimer = setTimeout(resetCopyFeedback, COPY_FEEDBACK_DURATION_MS);

    return () => clearTimeout(feedbackTimer);
  }, [copied]);

  const handleCopy = async () => {
    const copySucceeded = await copyToClipboard(code);
    if (copySucceeded) {
      setCopied(true);
    }
  };

  return (
    <div className="code-group">
      <div className="code-toolbar-outside">
        <span className={`code-lang${language ? '' : ' no-lang'}`}>{language || t('aiChat.codeLabel')}</span>
        <button
          type="button"
          className={`copy-btn${copied ? ' copied' : ''}`}
          disabled={copied}
          aria-label={t('aiChat.copyCodeAria')}
          onClick={handleCopy}
        >
          {t(copied ? 'aiChat.copyCodeDone' : 'aiChat.copyCode')}
        </button>
      </div>
      <pre className="code-block">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
