'use client';

import { useI18n } from '@/I18n/Index';
import { formatRadix, toSigned } from '@/Shared/Utils/Numbers';
import type { RegisterComponentProps } from '@/Types/Components';
import { useRegisterValue } from './Hooks/UseRegisterValue';
import RegisterFormatSelector from './Ui/RegisterFormatSelector';

const NAMED_REGISTERS = new Set(['AK', 'X', 'Y', 'I', 'L', 'S', 'A', 'JAML', 'JAL', 'RZ', 'RP', 'AP', 'RM', 'G', 'RB', 'WS']);

const RegisterComponent = ({
  label,
  id,
  classNames = 'register',
  model,
  numberFormat = 'dec',
  signedDec = false,
  wordBits = 12,
  showFormatSelector = true,
  onUpdateModel,
  onUpdateNumberFormat,
}: RegisterComponentProps) => {
  const { t } = useI18n();
  const fullName = t(NAMED_REGISTERS.has(label) ? `registers.names.${label}` : label);
  const { draft, updateValue, finishEditing } = useRegisterValue({
    label,
    model,
    numberFormat,
    fullName,
    onUpdateModel,
  });

  let formattedValue = t('registers.invalid');
  if (Number.isFinite(model)) {
    if (numberFormat === 'hex' || numberFormat === 'bin') {
      formattedValue = formatRadix(model, numberFormat);
    } else {
      formattedValue = String(signedDec ? toSigned(model, wordBits) : model);
    }
  }

  return (
    <div id={id} className={[classNames, 'register-container'].filter(Boolean).join(' ')}>
      <div className="register-container">
        <span title={fullName}>{label}</span>
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
            onBlur={finishEditing}
          />
        </div>
      </div>
      {showFormatSelector && <RegisterFormatSelector label={label} numberFormat={numberFormat} onChange={onUpdateNumberFormat} />}
    </div>
  );
};

export default RegisterComponent;
