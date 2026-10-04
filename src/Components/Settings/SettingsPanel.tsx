'use client';

import { useI18n } from '@/I18n/Index';
import type { SettingsPanelProps } from '@/Types/Components';
import PeopleSection from './PeopleSection';
import { useSettingsColors } from './SettingsPanel/Hooks/UseSettingsColors';
import SettingsActions from './SettingsPanel/Ui/SettingsActions';
import SettingsAppearance from './SettingsPanel/Ui/SettingsAppearance';
import SettingsColors from './SettingsPanel/Ui/SettingsColors';
import SettingsEditor from './SettingsPanel/Ui/SettingsEditor';
import SettingsExtras from './SettingsPanel/Ui/SettingsExtras';
import SettingsNumbers from './SettingsPanel/Ui/SettingsNumbers';

const SettingsPanel = (props: SettingsPanelProps) => {
  const { t } = useI18n();
  const { isAnimated = false, isMobile, platform = '', creators = [], caregivers = [], onClose } = props;
  const colors = useSettingsColors(props.onColorChange);

  return (
    <div
      id="settings"
      data-component="SettingsPanel"
      className={isAnimated ? 'slide-in' : 'slide-out'}
      onClick={(event) => event.stopPropagation()}
    >
      <header className="settingsHeader">
        <h1>{t('settings.title')}</h1>
        <div className="headerBtns">
          <button type="button" className="closeBtn" onClick={onClose} aria-label={t('settings.actions.close')}>
            &times;
          </button>
        </div>
      </header>
      <div className="settingsContent">
        <SettingsAppearance
          lightMode={props.lightMode}
          language={props.language}
          numberFormat={props.numberFormat}
          decSigned={props.decSigned}
          codeBits={props.codeBits}
          addresBits={props.addresBits}
          onUpdateLightMode={props.onUpdateLightMode}
          onUpdateLanguage={props.onUpdateLanguage}
          onUpdateNumberFormat={props.onUpdateNumberFormat}
          onUpdateDecSigned={props.onUpdateDecSigned}
        />
        <SettingsNumbers
          codeBits={props.codeBits}
          addresBits={props.addresBits}
          oddDelay={props.oddDelay}
          stepDelay={props.stepDelay}
          onUpdateCodeBits={props.onUpdateCodeBits}
          onUpdateAddresBits={props.onUpdateAddresBits}
          onUpdateOddDelay={props.onUpdateOddDelay}
          onUpdateStepDelay={props.onUpdateStepDelay}
        />
        {platform !== 'esp' && <SettingsExtras extras={props.extras} onUpdateExtras={props.onUpdateExtras} />}
        <SettingsEditor
          autocompleteEnabled={props.autocompleteEnabled}
          autoResetOnAsmCompile={props.autoResetOnAsmCompile}
          onUpdateAutocompleteEnabled={props.onUpdateAutocompleteEnabled}
          onUpdateAutoResetOnAsmCompile={props.onUpdateAutoResetOnAsmCompile}
        />
        <SettingsActions
          onOpenLabDialog={props.onOpenLabDialog}
          onResetValues={props.onResetValues}
          onDefaultSettings={props.onDefaultSettings}
          onOpenCommandList={props.onOpenCommandList}
        />
        {platform === 'esp' && <SettingsColors {...colors} />}
        {isMobile && <PeopleSection title={t('settings.people.caregivers')} people={caregivers} showGithub={false} />}
        {isMobile && <PeopleSection title={t('settings.people.creators')} people={creators} />}
      </div>
    </div>
  );
};

export default SettingsPanel;
