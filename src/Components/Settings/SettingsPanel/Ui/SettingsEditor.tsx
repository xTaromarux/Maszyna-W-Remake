import { useI18n } from '@/I18n/Index';
import type { SettingsPanelProps } from '@/Types/Components';
import Switch from './SettingsSwitch';
type SettingsEditorProps = Pick<
  SettingsPanelProps,
  'autocompleteEnabled' | 'autoResetOnAsmCompile' | 'onUpdateAutocompleteEnabled' | 'onUpdateAutoResetOnAsmCompile'
>;
const SettingsEditor = (props: SettingsEditorProps) => {
  const { t } = useI18n();
  const { autocompleteEnabled = true, autoResetOnAsmCompile = true } = props;
  return (
    <>
      <div className="flexColumn">
        <label>{t('settings.editor.heading')}</label>
        <div className="module-toggle-wrapper">
          <span className="module-label">{t('settings.editor.autocomplete')}</span>
          <Switch label={t('settings.editor.autocomplete')} checked={autocompleteEnabled} onChange={props.onUpdateAutocompleteEnabled} />
        </div>
      </div>
      <div className="flexColumn">
        <label>{t('settings.asm.heading')}</label>
        <div className="module-toggle-wrapper">
          <span className="module-label">{t('settings.asm.reset')}</span>
          <Switch label={t('settings.asm.reset')} checked={autoResetOnAsmCompile} onChange={props.onUpdateAutoResetOnAsmCompile} />
        </div>
        <p>{t('settings.asm.help')}</p>
      </div>
    </>
  );
};
export default SettingsEditor;
