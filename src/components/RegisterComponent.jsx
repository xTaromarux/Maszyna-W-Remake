'use client';

import { useEffect, useRef, useState } from 'react';
import KogWheelIcon from '@/assets/svg/KogWheelIcon';
import { useI18n } from '@/i18n';
import { useMachineServices } from '@/state/MachineContext';

const registerTypes = { AK: 'ACC', L: 'programCounter', JAML: 'JAL' };
const namedRegisters = new Set(['AK', 'X', 'Y', 'I', 'L', 'S', 'A', 'JAML', 'JAL', 'RZ', 'RP', 'AP', 'RM', 'G', 'RB', 'WS']);

export function parseRegisterInput(raw, numberFormat = 'dec') {
  const text = String(raw ?? '').trim();
  if (text === '' || text === '-') return null;
  let body = text;
  let sign = 1n;
  if (body.startsWith('-')) {
    sign = -1n;
    body = body.slice(1);
  }
  body = body.replace(/_/g, '');
  let base = numberFormat === 'hex' ? 16 : numberFormat === 'bin' ? 2 : 10;
  if (/^0x/i.test(body)) {
    base = 16;
    body = body.slice(2);
  } else if (/^0b/i.test(body)) {
    base = 2;
    body = body.slice(2);
  }
  if (!body || (base === 2 && /[^01]/.test(body)) || (base === 16 && /[^0-9a-f]/i.test(body)) || (base === 10 && /[^0-9]/.test(body))) return null;
  try {
    return sign * BigInt(base === 16 ? `0x${body}` : base === 2 ? `0b${body}` : body);
  } catch {
    return null;
  }
}

function formatInput(value, format) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '';
  return format === 'hex' ? Math.floor(value).toString(16).toUpperCase() : format === 'bin' ? Math.floor(value).toString(2) : String(value);
}

export default function RegisterComponent({ label, id, classNames = 'register', model, numberFormat = 'dec', signedDec = false, wordBits = 12, showFormatSelector = true, isEnableEditValue = true, onUpdateModel, onUpdateNumberFormat }) {
  const { t } = useI18n();
  const { showToast, getMaxValueForRegister } = useMachineServices();
  const rootRef = useRef(null);
  const selectorRef = useRef(null);
  const [edgeClass, setEdgeClass] = useState('');
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [draft, setDraft] = useState(() => formatInput(model, numberFormat));
  const fullName = t(namedRegisters.has(label) ? `registers.names.${label}` : label);

  useEffect(() => setDraft(formatInput(model, numberFormat)), [model, numberFormat]);
  useEffect(() => {
    if (!showFormatMenu) return;
    const closeMenu = (event) => {
      if (!selectorRef.current?.contains(event.target)) setShowFormatMenu(false);
    };
    const closeOnEscape = (event) => {
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
    const modulo = 2 ** wordBits;
    const unsigned = ((model % modulo) + modulo) % modulo;
    const signed = unsigned >= modulo / 2 ? unsigned - modulo : unsigned;
    formattedValue = numberFormat === 'hex' ? `0x${model.toString(16).toUpperCase()}` : numberFormat === 'bin' ? `0b${model.toString(2)}` : String(signedDec ? signed : model);
  }

  const updateValue = (event) => {
    const raw = event.target.value;
    const parsed = parseRegisterInput(raw, numberFormat);
    if (parsed === null) {
      setDraft(raw.trim() === '' || raw.trim() === '-' ? raw : formatInput(model, numberFormat));
      return;
    }
    const maximum = getMaxValueForRegister?.(registerTypes[label] || label);
    let normalized = parsed;
    if (typeof maximum === 'number' && Number.isFinite(maximum) && maximum >= 0) {
      const max = BigInt(maximum);
      if (parsed < 0n || parsed > max) {
        normalized = ((parsed % (max + 1n)) + max + 1n) % (max + 1n);
        showToast?.(t('common.validation.registerModulo', { value: String(parsed), max: maximum, name: fullName || label, result: Number(normalized) }));
      }
    }
    const value = Number(normalized);
    if (!Number.isFinite(value)) {
      setDraft(formatInput(model, numberFormat));
      return;
    }
    setDraft(formatInput(value, numberFormat));
    onUpdateModel?.(value);
  };

  return <div id={id} ref={rootRef} className={[classNames, edgeClass, 'register-container'].filter(Boolean).join(' ')}>
    {isEnableEditValue && <div className="register-container">
      <span title={fullName} onMouseEnter={() => {
        const bounds = rootRef.current.getBoundingClientRect();
        setEdgeClass(bounds.left < 50 ? 'edge-left' : bounds.right > window.innerWidth - 50 ? 'edge-right' : '');
      }} onMouseLeave={() => setEdgeClass('')}>{label}</span>
      <span>:</span>
      <div className="inputWrapper">
        <span>{formattedValue}</span>
        <input type={numberFormat === 'dec' ? 'number' : 'text'} inputMode={numberFormat === 'hex' ? 'text' : 'numeric'} className="hoverInput" aria-label={fullName} value={draft} onChange={updateValue} onBlur={() => {
          if (draft === '') {
            setDraft('0');
            onUpdateModel?.(0);
          } else setDraft(formatInput(model, numberFormat));
        }} />
      </div>
    </div>}
    {showFormatSelector && <div className="format-selector" ref={selectorRef}>
      <button type="button" className="format-button" aria-label={`${label}: DEC / HEX / BIN`} aria-expanded={showFormatMenu} onClick={(event) => {
        event.stopPropagation();
        setShowFormatMenu((open) => !open);
      }}><KogWheelIcon /></button>
      {showFormatMenu && <div className="format-menu">
        {['dec', 'hex', 'bin'].map((format) => <div key={format} role="button" tabIndex={0} className={numberFormat === format ? 'active' : ''} onClick={() => {
          onUpdateNumberFormat?.(format);
          setShowFormatMenu(false);
        }} onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onUpdateNumberFormat?.(format);
            setShowFormatMenu(false);
          }
        }}>{format.toUpperCase()}</div>)}
      </div>}
    </div>}
  </div>;
}
