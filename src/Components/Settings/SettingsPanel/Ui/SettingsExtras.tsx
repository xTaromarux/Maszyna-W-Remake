import { useI18n } from '@/I18n/Hooks/UseI18n';
import type { SettingsPanelProps } from '@/Components/Settings/Types';
import { useState } from 'react';
import SettingsSwitch from './SettingsSwitch';

const BOOLEAN_KEYS = ['xRegister', 'yRegister', 'dl', 'jamlExtras', 'busConnectors', 'showInvisibleRegisters'] as const;
const GROUPS = {
  io: ['rbRegister', 'gRegister'],
  stack: ['wsRegister', 'wylsSignal'],
  interrupts: ['rzRegister', 'rpRegister', 'rmRegister', 'apRegister', 'rintSignal', 'eniSignal'],
};

type SettingsExtrasProps = Pick<SettingsPanelProps, 'extras' | 'onUpdateExtras'>;

const SettingsExtras = ({ extras, onUpdateExtras }: SettingsExtrasProps) => {
  const { t } = useI18n();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const toggleGroup = (key: string) => setOpenGroups((previous) => ({ ...previous, [key]: !previous[key] }));

  const updateExtra = (key: (typeof BOOLEAN_KEYS)[number], checked: boolean) => {
    onUpdateExtras?.({ [key]: checked });
  };

  const updateGroup = (key: keyof typeof GROUPS, checked: boolean) => {
    const children = GROUPS[key];
    const groupPatch = Object.fromEntries(children.map((child) => [child, checked]));
    onUpdateExtras?.({ [key]: groupPatch });
  };

  const updateGroupItem = (key: keyof typeof GROUPS, child: string, checked: boolean) => {
    onUpdateExtras?.({ [key]: { [child]: checked } });
  };

  return (
    <div className="extras">
      <label>{t('settings.extras.heading')}</label>
      {BOOLEAN_KEYS.map((key) => (
        <div key={key} className="module-toggle-wrapper">
          <span className="module-label">{t(`settings.extras.labels.${key}`)}</span>
          <SettingsSwitch
            label={t(`settings.extras.labels.${key}`)}
            checked={extras[key]}
            onChange={(checked) => updateExtra(key, checked)}
          />
        </div>
      ))}
      {Object.entries(GROUPS).map(([key, children]) => {
        const groupKey = key as keyof typeof GROUPS;
        const values: Record<string, boolean> = extras[groupKey];
        const title = t(`settings.extras.groups.${key}.title`);
        const isOpen = Boolean(openGroups[key]);

        return (
          <div key={key} className={`settingsGroup${isOpen ? ' open' : ''}`}>
            <div className="settingsGroupHeader">
              <button type="button" className="settingsGroupToggle" aria-expanded={isOpen} onClick={() => toggleGroup(key)}>
                <span className="chevron" aria-hidden="true" />
                <span className="group-title">{title}</span>
              </button>
              <SettingsSwitch
                label={title}
                checked={children.every((child) => values[child])}
                onChange={(checked) => updateGroup(groupKey, checked)}
              />
            </div>
            <div className="collapsible" hidden={!isOpen}>
              {children.map((child) => (
                <div key={child} className="module-toggle-wrapper">
                  <span className="module-label">{t(`settings.extras.groups.${key}.${child}`)}</span>
                  <SettingsSwitch
                    label={t(`settings.extras.groups.${key}.${child}`)}
                    checked={values[child]}
                    onChange={(checked) => updateGroupItem(groupKey, child, checked)}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SettingsExtras;
