'use client';

import { useI18n } from '@/I18n/Index';
import type { IOPanelProps } from '@/Types/Components';
import type { InputEvent } from 'react';
import { useId } from 'react';

const IOPanel = ({
  devIn = 0,
  devOut = 0,
  devReady = 1,
  wordBits,
  formatNumber = String,
  onUpdateDevIn,
  onUpdateDevReady,
  className = '',
  ...rest
}: IOPanelProps) => {
  const { t } = useI18n();
  const inputId = useId();
  const wordMask = (1 << wordBits) - 1;
  const isReady = Boolean(devReady);
  const statusClassName = isReady ? 'ready' : 'busy';
  const statusLabel = t(isReady ? 'ioPanel.statusReady' : 'ioPanel.statusBusy');
  const outputCharacter = String.fromCharCode(devOut || 32);

  const handleCharacterInput = (event: InputEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const characterCode = input.value?.charCodeAt(0) || 0;
    const value = characterCode & wordMask;

    // A nonzero input waits for the processor; zero means the device is ready.
    onUpdateDevIn?.(value);
    onUpdateDevReady?.(value ? 0 : 1);
    input.value = '';
  };

  return (
    <div data-editor-io-panel="" {...rest} className={`io-card ${className}`}>
      <h3 data-editor-io-panel="">{t('ioPanel.title')}</h3>
      <div data-editor-io-panel="" className="row">
        <label data-editor-io-panel="" htmlFor={inputId}>
          {t('ioPanel.inputLabel')}
        </label>
        <input
          data-editor-io-panel=""
          id={inputId}
          type="text"
          maxLength={1}
          placeholder={t('ioPanel.inputPlaceholder')}
          onInput={handleCharacterInput}
        />
      </div>
      <div data-editor-io-panel="" className="row hint">
        <label data-editor-io-panel="" htmlFor={inputId} className="hint-label">
          {t('ioPanel.currentInput')}
        </label>
        <span data-editor-io-panel="" className="hint-value">
          {formatNumber(devIn)}
        </span>
      </div>
      <div data-editor-io-panel="" className="row">
        <label data-editor-io-panel="">{t('ioPanel.outputLabel')}</label>
        <div data-editor-io-panel="" className="value-box">
          {formatNumber(devOut)} ({outputCharacter})
        </div>
      </div>
      <div data-editor-io-panel="" className="row">
        <label data-editor-io-panel="">{t('ioPanel.statusLabel')}</label>
        <div data-editor-io-panel="" className={`status ${statusClassName}`}>
          {statusLabel}
        </div>
      </div>
    </div>
  );
};

export default IOPanel;
