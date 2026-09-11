'use client';

import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/i18n';
import { ErrorLevel, ErrorLevelColor } from '@/errors';

const pad = (number) => String(number).padStart(2, '0');
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const time = [pad(date.getHours()), pad(date.getMinutes()), pad(date.getSeconds())].join(':');
  if (date.toDateString() === new Date().toDateString()) return time;
  return `${[date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-')} ${time}`;
}
function getLogLevel(log) {
  if (log.error?.level) return log.error.level;
  if (log.level) return log.level;
  switch (log.class?.toLowerCase()) {
    case 'error': case 'parser-error': return ErrorLevel.ERROR;
    case 'warning': return ErrorLevel.WARNING;
    default: return ErrorLevel.INFO;
  }
}
const hasErrorDetails = (log) => !!(log.error?.code || log.error?.hint || log.error?.loc || log.error?.frame || log.error?.timestamp);
function Icon({ children }) { return <svg data-editor-console="" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{children}</svg>; }

export default function Console({ logs = [], onClose, onClear, className = '', ...rest }) {
  const { t } = useI18n();
  const [expandedEntries, setExpandedEntries] = useState(() => new Set());
  const contentRef = useRef(null);
  const followsBottom = useRef(true);
  const previousLogsLength = useRef(logs.length);
  const scrollTo = (bottom) => contentRef.current?.scrollTo({ top: bottom ? contentRef.current.scrollHeight : 0, behavior: 'smooth' });
  useEffect(() => {
    if (logs.length > previousLogsLength.current && followsBottom.current) scrollTo(true);
    if (!logs.length) setExpandedEntries(new Set());
    previousLogsLength.current = logs.length;
  }, [logs.length]);
  const toggleDetails = (index) => setExpandedEntries((current) => {
    const next = new Set(current);
    if (next.has(index)) next.delete(index); else next.add(index);
    return next;
  });

  return <div data-editor-console="" {...rest} id="console" className={`futuristic-console ${className}`}>
    <div data-editor-console="" className="console-header">
      <div data-editor-console="" className="header-left"><div data-editor-console="" className="status-indicator" /><span data-editor-console="" className="console-title">{t('console.title')}</span></div>
      <div data-editor-console="" className="header-center">
        <button data-editor-console="" onClick={() => scrollTo(false)} className="scroll-top-btn" title={t('console.scrollTop')}><Icon><path data-editor-console="" d="M18 15l-6-6-6 6" /></Icon></button>
        <button data-editor-console="" onClick={() => scrollTo(true)} className="scroll-bottom-btn" title={t('console.scrollBottom')}><Icon><path data-editor-console="" d="M6 9l6 6 6-6" /></Icon></button>
        <button data-editor-console="" onClick={onClear} className="clear-btn" title={t('console.clear')}><Icon><path data-editor-console="" d="M3 6h18" /><path data-editor-console="" d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path data-editor-console="" d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></Icon></button>
      </div>
      <div data-editor-console="" className="header-right"><span data-editor-console="" className="entry-count">{t('console.entryCount', { count: logs.length })}</span><button data-editor-console="" onClick={onClose} className="close-btn" title={t('console.close')}><Icon><path data-editor-console="" d="M18 6l-12 12" /><path data-editor-console="" d="M6 6l12 12" /></Icon></button></div>
    </div>
    <div data-editor-console="" className="console-content" ref={contentRef} onScroll={(event) => { const element = event.currentTarget; followsBottom.current = element.scrollTop + element.clientHeight >= element.scrollHeight - 10; }}>
      {logs.map((log, index) => {
        const level = getLogLevel(log);
        const color = ErrorLevelColor[level] || ErrorLevelColor[ErrorLevel.INFO];
        const hasDetails = hasErrorDetails(log);
        const error = log.error;
        return <div data-editor-console="" key={index} className={`console-entry level-${level.toLowerCase()}${hasDetails ? ' has-details' : ''}`}>
          <div data-editor-console="" className="entry-header" onClick={() => hasDetails && toggleDetails(index)}>
            <div data-editor-console="" className="entry-meta"><div data-editor-console="" className="severity-indicator" style={{ backgroundColor: color }} /><span data-editor-console="" className="timestamp">{formatTimestamp(log.timestamp)}</span><span data-editor-console="" className="level-badge" style={{ color }}>{level || log.class || 'INFO'}</span></div>
            <div data-editor-console="" className="entry-content"><div data-editor-console="" className="message-line"><span data-editor-console="" className="terminal-symbol">{'>_'}</span><span data-editor-console="" className="message">{log.message || error?.message || t('console.unknownMessage')}</span></div>
              {hasDetails && <button data-editor-console="" className={`details-toggle${expandedEntries.has(index) ? ' expanded' : ''}`} aria-expanded={expandedEntries.has(index)} aria-label={t('console.detailContext')} onClick={(event) => { event.stopPropagation(); toggleDetails(index); }}><Icon><circle data-editor-console="" cx="12" cy="12" r="10" /><path data-editor-console="" d="M12 16v-4" /><path data-editor-console="" d="M12 8h.01" /></Icon></button>}
            </div>
          </div>
          {expandedEntries.has(index) && hasDetails && <div data-editor-console="" className="entry-details"><div data-editor-console="" className="details-content">
            {error.code && <div data-editor-console="" className="detail-section"><span data-editor-console="" className="detail-label">{t('console.detailCode')}</span><code data-editor-console="" className="detail-value">{error.code}</code></div>}
            {error.hint && <div data-editor-console="" className="detail-section"><span data-editor-console="" className="detail-label">{t('console.detailHint')}</span><div data-editor-console="" className="detail-value hint-text">{error.hint}</div></div>}
            {error.loc && <div data-editor-console="" className="detail-section"><span data-editor-console="" className="detail-label">{t('console.detailLocation')}</span><code data-editor-console="" className="detail-value">{t('console.locationValue', { line: error.loc.line, column: error.loc.col })}</code></div>}
            {error.frame && <div data-editor-console="" className="detail-section code-frame"><span data-editor-console="" className="detail-label">{t('console.detailContext')}</span><pre data-editor-console="" className="detail-value code-block">{error.frame}</pre></div>}
            {error.timestamp && <div data-editor-console="" className="detail-section"><span data-editor-console="" className="detail-label">{t('console.detailOccurred')}</span><span data-editor-console="" className="detail-value">{new Date(error.timestamp).toLocaleString()}</span></div>}
          </div></div>}
        </div>;
      })}
    </div>
  </div>;
}
