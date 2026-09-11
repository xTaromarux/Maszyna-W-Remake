'use client';

import { useEffect, useState } from 'react';
import RegisterComponent from './RegisterComponent';

const bitsOf = (value) => Array.from({ length: 4 }, (_, index) => (value >> index) & 1);
const normalizeInputs = (inputs) => Array.from({ length: 4 }, (_, index) => inputs?.[index] ? 1 : 0);

export default function RZRegisterSection({ visible = true, RZ = 0, rzInputs, numberFormat, onUpdateRZ, onUpdateRzInputs, onUpdateNumberFormat }) {
  const [localInputs, setLocalInputs] = useState(() => rzInputs ? normalizeInputs(rzInputs) : bitsOf(RZ));
  useEffect(() => { if (rzInputs) setLocalInputs(normalizeInputs(rzInputs)); }, [rzInputs]);
  useEffect(() => setLocalInputs(bitsOf(RZ)), [RZ]);
  if (!visible) return null;
  const toggle = (index) => {
    const next = localInputs.map((value, current) => current === index ? (value ? 0 : 1) : value);
    setLocalInputs(next);
    onUpdateRzInputs?.(next);
    onUpdateRZ?.(next.reduce((value, bit, current) => value | (bit << current), 0));
  };
  return <div id="rzRegister" className="rz-register">
    <div className="rz-inputs">
      {localInputs.map((value, index) => <button key={index} className={`rz-input${value ? ' active' : ''}`} aria-pressed={Boolean(value)} onClick={() => toggle(index)} type="button">{index + 1}</button>)}
    </div>
    <RegisterComponent label="RZ" model={RZ} onUpdateModel={onUpdateRZ} numberFormat={numberFormat} onUpdateNumberFormat={onUpdateNumberFormat} />
  </div>;
}
