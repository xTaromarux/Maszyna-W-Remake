'use client';

import { useId } from 'react';
import { useI18n } from '@/i18n';

export default function IOPanel({ devIn = 0, devOut = 0, devReady = 1, wordBits, formatNumber = String, onUpdateDevIn, onUpdateDevReady, className = '', ...rest }) {
  const { t } = useI18n();
  const inputId = useId();
  const onInput = (event) => {
    const value = (event.target.value?.charCodeAt(0) || 0) & ((1 << wordBits) - 1);
    onUpdateDevIn?.(value);
    onUpdateDevReady?.(value ? 0 : 1);
    event.target.value = '';
  };
  return <div data-editor-io-panel="" {...rest} className={`io-card ${className}`}>
    <h3 data-editor-io-panel="">{t('ioPanel.title')}</h3>
    <div data-editor-io-panel="" className="row"><label data-editor-io-panel="" htmlFor={inputId}>{t('ioPanel.inputLabel')}</label><input data-editor-io-panel="" id={inputId} type="text" maxLength={1} placeholder={t('ioPanel.inputPlaceholder')} onInput={onInput} /></div>
    <div data-editor-io-panel="" className="row hint"><label data-editor-io-panel="" htmlFor={inputId} className="hint-label">{t('ioPanel.currentInput')}</label><span data-editor-io-panel="" className="hint-value">{formatNumber(devIn)}</span></div>
    <div data-editor-io-panel="" className="row"><label data-editor-io-panel="">{t('ioPanel.outputLabel')}</label><div data-editor-io-panel="" className="value-box">{formatNumber(devOut)} ({String.fromCharCode(devOut || 32)})</div></div>
    <div data-editor-io-panel="" className="row"><label data-editor-io-panel="">{t('ioPanel.statusLabel')}</label><div data-editor-io-panel="" className={`status ${devReady ? 'ready' : 'busy'}`}>{t(devReady ? 'ioPanel.statusReady' : 'ioPanel.statusBusy')}</div></div>
  </div>;
}
