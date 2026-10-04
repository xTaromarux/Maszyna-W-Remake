import SegmentedToggle from '@/Shared/Ui/SegmentedToggle/SegmentedToggle';
import { useI18n } from '@/I18n/Hooks/UseI18n';
import type { Update } from '@/Shared/Types/Common';
import type { SettingsPanelProps } from '@/Components/Settings/Types';
import type { ToggleOption, ToggleValue } from '@/Shared/Ui/SegmentedToggle/Types';
import type { ReactNode } from 'react';

type AppearanceProps = Pick<
  SettingsPanelProps,
  | 'lightMode'
  | 'language'
  | 'numberFormat'
  | 'decSigned'
  | 'codeBits'
  | 'addresBits'
  | 'onUpdateLightMode'
  | 'onUpdateLanguage'
  | 'onUpdateNumberFormat'
  | 'onUpdateDecSigned'
>;

interface SettingsChoiceProps<T extends ToggleValue> {
  label: ReactNode;
  options: ToggleOption<T>[];
  value: T | undefined;
  onChange?: Update<T>;
}

/** Presents one appearance choice with the settings panel's existing label and wrapper. */
const SettingsChoice = <T extends ToggleValue>({ label, options, value, onChange }: SettingsChoiceProps<T>) => (
  <div className="flexColumn">
    {label && <label>{label}:</label>}
    <SegmentedToggle options={options} modelValue={value} onUpdateModelValue={onChange} />
  </div>
);

const SettingsAppearance = (props: AppearanceProps) => {
  const { t } = useI18n();
  const { lightMode, language = 'pl', numberFormat, decSigned = false, codeBits, addresBits } = props;
  const options = <const T extends ToggleValue>(prefix: string, values: readonly (readonly [string, T])[]) =>
    values.map(([key, value]) => ({ label: t(`${prefix}.${key}`), value }));

  return (
    <>
      <SettingsChoice
        label={null}
        options={options('settings.theme', [
          ['light', true],
          ['dark', false],
        ])}
        value={lightMode}
        onChange={props.onUpdateLightMode}
      />
      <SettingsChoice
        label={t('settings.language.label')}
        options={options('settings.language', [
          ['pl', 'pl'],
          ['en', 'en'],
        ])}
        value={language}
        onChange={props.onUpdateLanguage}
      />
      <SettingsChoice
        label={t('settings.numberFormat.label')}
        options={options('settings.numberFormat.options', [
          ['dec', 'dec'],
          ['hex', 'hex'],
          ['bin', 'bin'],
        ])}
        value={numberFormat}
        onChange={props.onUpdateNumberFormat}
      />
      {numberFormat === 'dec' && (
        <div className="flexColumn">
          <label>{t('settings.decSigned.label')}:</label>
          <SegmentedToggle
            options={options('settings.decSigned.options', [
              ['unsigned', false],
              ['signed', true],
            ])}
            modelValue={decSigned}
            onUpdateModelValue={props.onUpdateDecSigned}
          />
          <p>{t('settings.decSigned.hint', { bits: codeBits + addresBits })}</p>
        </div>
      )}
    </>
  );
};
export default SettingsAppearance;
