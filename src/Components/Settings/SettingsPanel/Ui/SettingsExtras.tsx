import { useI18n } from '@/I18n/Hooks/UseI18n';
import type { SettingsPanelProps } from '@/Components/Settings/Types';
import type { InterruptVectors } from '@/Machine/Types/Machine';
import { useState } from 'react';
import SettingsSwitch from './SettingsSwitch';
import { SettingsNumberField } from './SettingsNumbers';

const BOOLEAN_KEYS = ['xRegister', 'yRegister', 'dl', 'jamlExtras', 'busConnectors', 'showInvisibleRegisters'] as const;
const GROUPS = {
  io: ['rbRegister', 'gRegister'],
  stack: ['wsRegister', 'wylsSignal'],
  interrupts: ['rzRegister', 'rpRegister', 'rmRegister', 'apRegister', 'rintSignal', 'eniSignal'],
};

type SettingsExtrasProps = Pick<
  SettingsPanelProps,
  'extras' | 'onUpdateExtras' | 'addresBits' | 'interruptVectors' | 'onUpdateInterruptVectors'
>;

const SettingsExtras = ({ extras, onUpdateExtras, addresBits, interruptVectors, onUpdateInterruptVectors }: SettingsExtrasProps) => {
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
              {groupKey === 'interrupts' && (
                <>
                  <div className="module-toggle-wrapper">
                    <span className="module-label">{t('settings.extras.groups.interrupts.eniAlwaysEnabled')}</span>
                    <SettingsSwitch
                      label={t('settings.extras.groups.interrupts.eniAlwaysEnabled')}
                      checked={extras.interrupts.eniAlwaysEnabled}
                      onChange={(checked) => updateGroupItem('interrupts', 'eniAlwaysEnabled', checked)}
                    />
                  </div>
                  <p>{t('settings.extras.groups.interrupts.addressHelp')}</p>
                  {interruptVectors.map((address, index) => (
                    <SettingsNumberField
                      key={index}
                      id={`irq${index + 1}Address`}
                      labelKey={`settings.extras.groups.interrupts.irq${index + 1}Address`}
                      value={address}
                      min={0}
                      max={(1 << addresBits) - 1}
                      onChange={(value) => {
                        const next = [...interruptVectors] as InterruptVectors;
                        next[index] = value;
                        onUpdateInterruptVectors?.(next);
                      }}
                    />
                  ))}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SettingsExtras;
