'use client';

import type { SavedColor } from '@/types/colors';
import CommandListIcon from '@/assets/svg/CommandListIcon';
import RefreshIcon from '@/assets/svg/RefreshIcon';
import SegmentedToggle from '@/components/SegmentedToggle';
import { useI18n } from '@/i18n';
import type { ColorSelection, ColorTarget } from '@/types/colors';
import type { Update } from '@/types/common';
import type { PendingColor, SettingsNumber, SettingsPanelProps, SwitchProps, ToggleOption, ToggleValue } from '@/types/components';
import type { ReactNode } from 'react';
import { useState } from 'react';
import ColorPickerPopup from './ColorPickerPopup';
import PeopleSection from './PeopleSection';

const BOOLEAN_KEYS = ['xRegister', 'yRegister', 'dl', 'jamlExtras', 'busConnectors', 'showInvisibleRegisters'] as const;
const GROUPS = {
  io: ['rbRegister', 'gRegister'],
  stack: ['wsRegister', 'wylsSignal'],
  interrupts: ['rzRegister', 'rpRegister', 'rmRegister', 'apRegister', 'rintSignal', 'eniSignal'],
};
const NUMBERS: readonly SettingsNumber[] = [
  ['codeBits', 'commandBits', 'bits.codeLabel', 'bits.codeHelp', 1, 16],
  ['addresBits', 'addresBits', 'bits.addressLabel', 'bits.addressHelp', 1, 16],
  ['oddDelay', 'oddDelay', 'delays.microLabel', 'delays.microHelp', 0, 10000],
  ['stepDelay', 'stepDelay', 'delays.stepLabel', 'delays.stepHelp', 5, 10000],
];
const INITIAL_COLORS = {
  signal_line: { color: '#ff0000', brightness: 1 },
  display: { color: '#00ff00', brightness: 1 },
  bus: { color: '#0000ff', brightness: 1 },
};

function Switch({ label, checked, onChange }: SwitchProps) {
  return (
    <label className="switch" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
      <input type="checkbox" aria-label={label} checked={!!checked} onChange={(event) => onChange?.(event.target.checked)} />
      <span className="slider round" />
    </label>
  );
}

export default function SettingsPanel(props: SettingsPanelProps) {
  const { t } = useI18n();
  const {
    isAnimated = false,
    isMobile,
    lightMode,
    language = 'pl',
    numberFormat,
    decSigned = false,
    codeBits,
    addresBits,
    extras,
    platform = '',
    autocompleteEnabled = true,
    autoResetOnAsmCompile = true,
    creators = [],
    caregivers = [],
    onClose,
    onUpdateExtras,
    onColorChange,
  } = props;
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  const [colors, setColors] = useState<Record<ColorTarget, SavedColor>>(INITIAL_COLORS);
  const [pendingColors, setPendingColors] = useState<Partial<Record<ColorTarget, PendingColor>>>({});
  const [currentColorType, setCurrentColorType] = useState<ColorTarget | null>(null);
  const toggleOpen = (key: string) => setOpenMap((previous) => ({ ...previous, [key]: !previous[key] }));
  const options = <const T extends ToggleValue>(prefix: string, values: readonly (readonly [string, T])[]) =>
    values.map(([key, value]) => ({ label: t(`${prefix}.${key}`), value }));
  const choice = <T extends ToggleValue>(label: ReactNode, values: ToggleOption<T>[], value: T | undefined, onChange?: Update<T>) => (
    <div className="flexColumn">
      {label && <label>{label}:</label>}
      <SegmentedToggle options={values} modelValue={value} onUpdateModelValue={onChange} />
    </div>
  );
  const colorTitles = { signal_line: 'signalLine', display: 'display', bus: 'bus' };
  const applyColor = (colorInfo: ColorSelection) => {
    if (!currentColorType) return;
    setColors((previous) => ({ ...previous, [currentColorType]: colorInfo }));
    setPendingColors((previous) => ({ ...previous, [currentColorType]: { ...colorInfo, type: `${currentColorType}_hex` } }));
    setCurrentColorType(null);
  };
  const sendColors = () => {
    Object.values(pendingColors).forEach(({ type, brightness, colorData }) =>
      onColorChange?.({ type, hex: colorData.hex, rgb: colorData.rgb, hsv: colorData.hsv, brightness, rgbScaled: colorData.rgbScaled })
    );
    setPendingColors({});
  };
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
          <button className="closeBtn" onClick={onClose} aria-label={t('settings.actions.close')}>
            &times;
          </button>
        </div>
      </header>
      <div className="settingsContent">
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
        {NUMBERS.map(([key, id, label, help, min, limit]) => {
          const max = key === 'codeBits' ? Math.min(limit, 30 - addresBits) : key === 'addresBits' ? Math.min(limit, 30 - codeBits) : limit;
          return (
            <div key={key} className="flexColumn">
              <label htmlFor={id}>{t(`settings.${label}`)}</label>
              <input
                id={id}
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={props[key]}
                min={min}
                max={max}
                onChange={(event) => {
                  const value = Number.parseInt(event.target.value, 10);
                  if (Number.isFinite(value) && value >= min && value <= max) {
                    const handler = {
                      codeBits: props.onUpdateCodeBits,
                      addresBits: props.onUpdateAddresBits,
                      oddDelay: props.onUpdateOddDelay,
                      stepDelay: props.onUpdateStepDelay,
                    }[key];
                    handler?.(value);
                  }
                }}
              />
              <p>{t(`settings.${help}`)}</p>
            </div>
          );
        })}
        {platform !== 'esp' && (
          <div className="extras">
            <label>{t('settings.extras.heading')}</label>
            {BOOLEAN_KEYS.map((key) => (
              <div key={key} className="module-toggle-wrapper">
                <span className="module-label">{t(`settings.extras.labels.${key}`)}</span>
                <Switch
                  label={t(`settings.extras.labels.${key}`)}
                  checked={extras[key]}
                  onChange={(checked) => onUpdateExtras?.({ [key]: checked })}
                />
              </div>
            ))}
            {Object.entries(GROUPS).map(([key, children]) => (
              <div key={key} className={`settingsGroup${openMap[key] ? ' open' : ''}`}>
                <div
                  className="settingsGroupHeader"
                  role="button"
                  aria-expanded={!!openMap[key]}
                  tabIndex={0}
                  onClick={() => toggleOpen(key)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      toggleOpen(key);
                    }
                  }}
                >
                  <span className="chevron" aria-hidden="true" />
                  <span className="group-title">{t(`settings.extras.groups.${key}.title`)}</span>
                  <Switch
                    label={t(`settings.extras.groups.${key}.title`)}
                    checked={children.every((child) => !!Reflect.get(Reflect.get(extras, key), child) as boolean)}
                    onChange={(checked) => onUpdateExtras?.({ [key]: Object.fromEntries(children.map((child) => [child, checked])) })}
                  />
                </div>
                <div className="collapsible" hidden={!openMap[key]}>
                  {children.map((child) => (
                    <div key={child} className="module-toggle-wrapper">
                      <span className="module-label">{t(`settings.extras.groups.${key}.${child}`)}</span>
                      <Switch
                        label={t(`settings.extras.groups.${key}.${child}`)}
                        checked={Reflect.get(Reflect.get(extras, key), child) as boolean}
                        onChange={(checked) => onUpdateExtras?.({ [key]: { [child]: checked } })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
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
        <div className="flexColumn">
          <div className="flexColumn button-column">
            {(
              [
                ['openLabDialog', 'labs.chooseButton', props.onOpenLabDialog, CommandListIcon],
                ['resetValues', 'settings.actions.resetRegisters', props.onResetValues, RefreshIcon],
                ['defaultSettings', 'settings.actions.defaultSettings', props.onDefaultSettings, RefreshIcon],
                ['openCommandList', 'settings.actions.commandList', props.onOpenCommandList, CommandListIcon],
              ] as const
            ).map(([id, label, handler, Icon]) => (
              <button key={id} id={id} className="SvgAndTextButton compact-button execution-btn execution-btn--step" onClick={handler}>
                <Icon />
                <span>{t(label)}</span>
              </button>
            ))}
          </div>
        </div>
        {platform === 'esp' && (
          <div className="color-section">
            <h3 className="color-section-title">{t('settings.colors.heading')}</h3>
            <div className="color-buttons-list">
              {(Object.keys(colors) as ColorTarget[]).map((key) => (
                <button key={key} className="color-selection-btn" onClick={() => setCurrentColorType(key)}>
                  <span className="color-label">{t(`settings.colors.${key === 'signal_line' ? 'signalLines' : key}`)}</span>
                  <span className="color-dot" style={{ backgroundColor: colors[key].color }} />
                </button>
              ))}
            </div>
            <button className="send-colors-btn" onClick={sendColors} disabled={!Object.keys(pendingColors).length}>
              <span>{t('settings.actions.sendAllColors')}</span>
            </button>
          </div>
        )}
        {currentColorType && (
          <ColorPickerPopup
            visible
            title={t(`settings.colorPicker.${colorTitles[currentColorType]}`)}
            {...colors[currentColorType]}
            onClose={() => setCurrentColorType(null)}
            onApply={applyColor}
          />
        )}
        <PeopleSection isMobile={isMobile} title={t('settings.people.caregivers')} people={caregivers} showGithub={false} />
        <PeopleSection isMobile={isMobile} title={t('settings.people.creators')} people={creators} />
      </div>
    </div>
  );
}
