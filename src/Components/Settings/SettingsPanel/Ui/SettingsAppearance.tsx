import SegmentedToggle from '@/Components/SegmentedToggle';
import { useI18n } from '@/I18n/Index';
import type { Update } from '@/Types/Common';
import type { SettingsPanelProps, ToggleOption, ToggleValue } from '@/Types/Components';
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

const SettingsAppearance = (props: AppearanceProps) => {
  const { t } = useI18n();
  const { lightMode, language = 'pl', numberFormat, decSigned = false, codeBits, addresBits } = props;
  const options = <const T extends ToggleValue>(prefix: string, values: readonly (readonly [string, T])[]) =>
    values.map(([key, value]) => ({ label: t(`${prefix}.${key}`), value }));
  const choice = <T extends ToggleValue>(label: ReactNode, values: ToggleOption<T>[], value: T | undefined, onChange?: Update<T>) => (
    <div className="flexColumn">
      {label && <label>{label}:</label>}
      <SegmentedToggle options={values} modelValue={value} onUpdateModelValue={onChange} />
    </div>
  );

  return (
    <>
      {choice(
        null,
        options('settings.theme', [
          ['light', true],
          ['dark', false],
        ]),
        lightMode,
        props.onUpdateLightMode
      )}
      {choice(
        t('settings.language.label'),
        options('settings.language', [
          ['pl', 'pl'],
          ['en', 'en'],
        ]),
        language,
        props.onUpdateLanguage
      )}
      {choice(
        t('settings.numberFormat.label'),
        options('settings.numberFormat.options', [
          ['dec', 'dec'],
          ['hex', 'hex'],
          ['bin', 'bin'],
        ]),
        numberFormat,
        props.onUpdateNumberFormat
      )}
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
