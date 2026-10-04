'use client';

import useWindowWidth from '@/hooks/useWindowWidth';
import { useI18n } from '@/i18n';
import { toSigned, toUnsigned } from '@/shared/utils/numbers';
import { useMachineServices } from '@/state/MachineContext';
import type { MemoryContentProps, MemoryInputProps } from '@/types/components';
import { Fragment, useEffect, useState } from 'react';
import RegisterComponent from './RegisterComponent';
import SignalButton from './SignalButton';

function MemoryInput({ value, min, max, label, onChange }: MemoryInputProps) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  return (
    <input
      inputMode="numeric"
      type="number"
      className="hoverInput"
      aria-label={label}
      value={draft}
      min={min}
      max={max}
      onChange={(event) => {
        const raw = event.target.value;
        setDraft(raw);
        if (raw.trim() === '' || raw.trim() === '-') return;
        if (!onChange(raw)) setDraft(String(value));
      }}
      onBlur={() => {
        if (draft.trim() === '' || draft.trim() === '-') {
          onChange('0');
          setDraft('0');
        } else setDraft(String(value));
      }}
    />
  );
}

export default function MemoryContent({
  A,
  S,
  mem,
  signals,
  formatNumber,
  decToCommand,
  decToArgument,
  aFormat,
  sFormat,
  signedDec = false,
  wordBits = 8,
  onUpdateA,
  onUpdateS,
  onUpdateMem,
  onClickItem,
  onUpdateAFormat,
  onUpdateSFormat,
}: MemoryContentProps) {
  const width = useWindowWidth();
  const isMobile = width < 1080;
  const { t } = useI18n();
  const { showToast } = useMachineServices();
  const modulo = 2 ** wordBits;
  const min = signedDec ? -modulo / 2 : 0;
  const max = signedDec ? modulo / 2 - 1 : modulo - 1;
  const displayValue = (raw: number) => (signedDec ? toSigned(raw, wordBits) : toUnsigned(raw, wordBits));
  const updateMemoryValue = (raw: string, index: number) => {
    const value = parseInt(raw, 10);
    if (Number.isNaN(value)) return false;
    if (value < min || value > max) {
      showToast?.(t('memory.outOfRange', { val: value, min, max, bits: wordBits }));
      return false;
    }
    const next = [...mem];
    next[index] = toUnsigned(value, wordBits);
    onUpdateMem?.(next);
    return true;
  };

  return (
    <div id="memory">
      {!isMobile && (
        <SignalButton
          id="wea"
          signal={signals.wea}
          label="wea"
          divClassNames="pathDownOnRight"
          spanClassNames="arrowRightOnBottom"
          onClick={() => onClickItem?.('wea')}
        />
      )}
      <RegisterComponent
        classNames="register"
        id="aRegister"
        label="A"
        model={A}
        onUpdateModel={onUpdateA}
        numberFormat={aFormat}
        onUpdateNumberFormat={onUpdateAFormat}
      />
      <div id="memoryTable">
        <div className="scrollWrapper">
          <div className="memoryContainer">
            <span className="label">{t(width < 1400 ? 'memory.labelShort' : 'memory.labelFull')}</span>
            <span className="label">{t('memory.value')}</span>
            <span className="label">{t('memory.code')}</span>
            <span className="label">{t('memory.address')}</span>
            {mem.map((value, index) => {
              const selected = A === index ? 'selected' : '';
              const command = decToCommand(value);
              return (
                <Fragment key={index}>
                  <span className={selected}>{formatNumber(index)}</span>
                  <div className={`inputWrapper${selected ? ' selected' : ''}`}>
                    <span>{formatNumber(value)}</span>
                    <MemoryInput
                      value={displayValue(value)}
                      min={min}
                      max={max}
                      label={t('memory.cellLabel', { index })}
                      onChange={(raw) => updateMemoryValue(raw, index)}
                    />
                  </div>
                  <span className={selected}>{command ? command.name : t('memory.empty')}</span>
                  <span className={selected}>{formatNumber(decToArgument(value))}</span>
                </Fragment>
              );
            })}
          </div>
        </div>
      </div>
      <RegisterComponent
        classNames="register"
        id="sRegister"
        label="S"
        model={S}
        onUpdateModel={onUpdateS}
        numberFormat={sFormat}
        onUpdateNumberFormat={onUpdateSFormat}
      />
      {!isMobile && (
        <>
          <div id="operations">
            <SignalButton
              id="czyt"
              signal={signals.czyt}
              label="czyt"
              spanClassNames="lineLeftOnBottom"
              onClick={() => onClickItem?.('czyt')}
            />
            <SignalButton
              id="pisz"
              signal={signals.pisz}
              label="pisz"
              spanClassNames="lineLeftOnBottom"
              onClick={() => onClickItem?.('pisz')}
            />
          </div>
          <div className="signals">
            <SignalButton
              id="wes"
              signal={signals.wes}
              label="wes"
              divClassNames="pathUpOnRight"
              spanClassNames="arrowRightOnBottom"
              onClick={() => onClickItem?.('wes')}
            />
            <SignalButton
              id="wys"
              signal={signals.wys}
              label="wys"
              divClassNames="pathDownOnLeft"
              spanClassNames="lineLeftOnBottom"
              onClick={() => onClickItem?.('wys')}
            />
          </div>
        </>
      )}
    </div>
  );
}
