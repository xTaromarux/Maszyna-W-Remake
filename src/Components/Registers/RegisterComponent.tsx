'use client';

import KogWheelIcon from '@/Assets/Svg/KogWheelIcon';
import { useI18n } from '@/I18n/Index';
import { formatNumberInput, formatRadix, positiveModulo, toSigned } from '@/Shared/Utils/Numbers';
import { parseRegisterInput } from '@/Shared/Utils/RegisterInput';
import { useMachineServices } from '@/State/MachineContext';
import type { RegisterComponentProps } from '@/Types/Components';
import type { ChangeEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

const registerTypes: Record<string, string> = { AK: 'ACC', L: 'programCounter', JAML: 'JAL' };
const namedRegisters = new Set(['AK', 'X', 'Y', 'I', 'L', 'S', 'A', 'JAML', 'JAL', 'RZ', 'RP', 'AP', 'RM', 'G', 'RB', 'WS']);

export default function RegisterComponent({
  label,
  id,
  classNames = 'register',
  model,
  numberFormat = 'dec',
  signedDec = false,
  wordBits = 12,
  showFormatSelector = true,
  isEnableEditValue = true,
  onUpdateModel,
  onUpdateNumberFormat,
}: RegisterComponentProps) {
  const { t } = useI18n();
  const { showToast, getMaxValueForRegister } = useMachineServices();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const selectorRef = useRef<HTMLDivElement | null>(null);
  const [edgeClass, setEdgeClass] = useState('');
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [draft, setDraft] = useState(() => formatNumberInput(model, numberFormat));
  const fullName = t(namedRegisters.has(label) ? `registers.names.${label}` : label);

  useEffect(() => setDraft(formatNumberInput(model, numberFormat)), [model, numberFormat]);
  useEffect(() => {
    if (!showFormatMenu) return;
    const closeMenu = (event: MouseEvent) => {
      if (!selectorRef.current?.contains(event.target as Node | null)) setShowFormatMenu(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowFormatMenu(false);
    };
    document.addEventListener('click', closeMenu);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('click', closeMenu);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [showFormatMenu]);

  let formattedValue = t('registers.invalid');
  if (typeof model === 'number' && !Number.isNaN(model)) {
    formattedValue =
      numberFormat === 'hex' || numberFormat === 'bin'
        ? formatRadix(model, numberFormat)
        : String(signedDec ? toSigned(model, wordBits) : model);
  }

  const updateValue = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    const parsed = parseRegisterInput(raw, numberFormat);
    if (parsed === null) {
      setDraft(raw.trim() === '' || raw.trim() === '-' ? raw : formatNumberInput(model, numberFormat));
      return;
    }
    const maximum = getMaxValueForRegister?.(registerTypes[label] || label);
    let normalized = parsed;
    if (typeof maximum === 'number' && Number.isFinite(maximum) && maximum >= 0) {
      const max = BigInt(maximum);
      if (parsed < 0n || parsed > max) {
        normalized = positiveModulo(parsed, max + 1n);
        showToast?.(
          t('common.validation.registerModulo', {
            value: String(parsed),
            max: maximum,
            name: fullName || label,
            result: Number(normalized),
          })
        );
      }
    }
    const value = Number(normalized);
    if (!Number.isFinite(value)) {
      setDraft(formatNumberInput(model, numberFormat));
      return;
    }
    setDraft(formatNumberInput(value, numberFormat));
    onUpdateModel?.(value);
  };

  return (
    <div id={id} ref={rootRef} className={[classNames, edgeClass, 'register-container'].filter(Boolean).join(' ')}>
      {isEnableEditValue && (
        <div className="register-container">
          <span
            title={fullName}
            onMouseEnter={() => {
              const bounds = rootRef.current?.getBoundingClientRect();
              if (!bounds) return;
              setEdgeClass(bounds.left < 50 ? 'edge-left' : bounds.right > window.innerWidth - 50 ? 'edge-right' : '');
            }}
            onMouseLeave={() => setEdgeClass('')}
          >
            {label}
          </span>
          <span>:</span>
          <div className="inputWrapper">
            <span>{formattedValue}</span>
            <input
              type={numberFormat === 'dec' ? 'number' : 'text'}
              inputMode={numberFormat === 'hex' ? 'text' : 'numeric'}
              className="hoverInput"
              aria-label={fullName}
              value={draft}
              onChange={updateValue}
              onBlur={() => {
                if (draft === '') {
                  setDraft('0');
                  onUpdateModel?.(0);
                } else setDraft(formatNumberInput(model, numberFormat));
              }}
            />
          </div>
        </div>
      )}
      {showFormatSelector && (
        <div className="format-selector" ref={selectorRef}>
          <button
            type="button"
            className="format-button"
            aria-label={`${label}: DEC / HEX / BIN`}
            aria-expanded={showFormatMenu}
            onClick={(event) => {
              event.stopPropagation();
              setShowFormatMenu((open) => !open);
            }}
          >
            <KogWheelIcon />
          </button>
          {showFormatMenu && (
            <div className="format-menu">
              {(['dec', 'hex', 'bin'] as const).map((format) => (
                <div
                  key={format}
                  role="button"
                  tabIndex={0}
                  className={numberFormat === format ? 'active' : ''}
                  onClick={() => {
                    onUpdateNumberFormat?.(format);
                    setShowFormatMenu(false);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onUpdateNumberFormat?.(format);
                      setShowFormatMenu(false);
                    }
                  }}
                >
                  {format.toUpperCase()}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
