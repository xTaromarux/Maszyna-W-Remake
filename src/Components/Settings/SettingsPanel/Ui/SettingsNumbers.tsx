import { useI18n } from '@/I18n/Hooks/UseI18n';
import type { SettingsPanelProps } from '@/Components/Settings/Types';
import type { Update } from '@/Shared/Types/Common';

type SettingsNumbersProps = Pick<
  SettingsPanelProps,
  | 'codeBits'
  | 'addresBits'
  | 'oddDelay'
  | 'stepDelay'
  | 'onUpdateCodeBits'
  | 'onUpdateAddresBits'
  | 'onUpdateOddDelay'
  | 'onUpdateStepDelay'
>;

interface NumberField {
  id: string;
  labelKey: string;
  helpKey: string;
  value: number;
  min: number;
  max: number;
  onChange?: Update<number>;
}

const SettingsNumberField = ({ id, labelKey, helpKey, value, min, max, onChange }: NumberField) => {
  const { t } = useI18n();
  const updateNumber = (input: string) => {
    const next = Number.parseInt(input, 10);
    if (Number.isFinite(next) && next >= min && next <= max) {
      onChange?.(next);
    }
  };

  return (
    <div className="flexColumn">
      <label htmlFor={id}>{t(labelKey)}</label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        min={min}
        max={max}
        onChange={(event) => updateNumber(event.target.value)}
      />
      <p>{t(helpKey)}</p>
    </div>
  );
};

const SettingsNumbers = (props: SettingsNumbersProps) => {
  const fields: NumberField[] = [
    {
      id: 'commandBits',
      labelKey: 'settings.bits.codeLabel',
      helpKey: 'settings.bits.codeHelp',
      value: props.codeBits,
      min: 1,
      max: Math.min(16, 30 - props.addresBits),
      onChange: props.onUpdateCodeBits,
    },
    {
      id: 'addresBits',
      labelKey: 'settings.bits.addressLabel',
      helpKey: 'settings.bits.addressHelp',
      value: props.addresBits,
      min: 1,
      max: Math.min(16, 30 - props.codeBits),
      onChange: props.onUpdateAddresBits,
    },
    {
      id: 'oddDelay',
      labelKey: 'settings.delays.microLabel',
      helpKey: 'settings.delays.microHelp',
      value: props.oddDelay,
      min: 0,
      max: 10000,
      onChange: props.onUpdateOddDelay,
    },
    {
      id: 'stepDelay',
      labelKey: 'settings.delays.stepLabel',
      helpKey: 'settings.delays.stepHelp',
      value: props.stepDelay,
      min: 5,
      max: 10000,
      onChange: props.onUpdateStepDelay,
    },
  ];

  return fields.map((field) => <SettingsNumberField key={field.id} {...field} />);
};

export default SettingsNumbers;
