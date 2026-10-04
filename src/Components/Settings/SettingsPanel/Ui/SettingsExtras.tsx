import { useI18n } from '@/I18n/Index';
import type { SettingsPanelProps } from '@/Types/Components';
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

  return (
    <div className="extras">
      <label>{t('settings.extras.heading')}</label>
      {BOOLEAN_KEYS.map((key) => (
        <div key={key} className="module-toggle-wrapper">
          <span className="module-label">{t(`settings.extras.labels.${key}`)}</span>
          <SettingsSwitch
            label={t(`settings.extras.labels.${key}`)}
            checked={extras[key]}
            onChange={(checked) => onUpdateExtras?.({ [key]: checked })}
          />
        </div>
      ))}
      {Object.entries(GROUPS).map(([key, children]) => {
        const values: Record<string, boolean> = extras[key as keyof typeof GROUPS];
        const title = t(`settings.extras.groups.${key}.title`);
        const isOpen = Boolean(openGroups[key]);

        return (
          <div key={key} className={`settingsGroup${isOpen ? ' open' : ''}`}>
            <div
              className="settingsGroupHeader"
              role="button"
              aria-expanded={isOpen}
              tabIndex={0}
              onClick={() => toggleGroup(key)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  toggleGroup(key);
                }
              }}
            >
              <span className="chevron" aria-hidden="true" />
              <span className="group-title">{title}</span>
              <SettingsSwitch
                label={title}
                checked={children.every((child) => values[child])}
                onChange={(checked) => onUpdateExtras?.({ [key]: Object.fromEntries(children.map((child) => [child, checked])) })}
              />
            </div>
            <div className="collapsible" hidden={!isOpen}>
              {children.map((child) => (
                <div key={child} className="module-toggle-wrapper">
                  <span className="module-label">{t(`settings.extras.groups.${key}.${child}`)}</span>
                  <SettingsSwitch
                    label={t(`settings.extras.groups.${key}.${child}`)}
                    checked={values[child]}
                    onChange={(checked) => onUpdateExtras?.({ [key]: { [child]: checked } })}
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
