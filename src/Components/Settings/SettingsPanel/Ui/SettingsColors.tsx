import { useI18n } from '@/I18n/Index';
import type { ColorTarget } from '@/Types/Colors';
import ColorPickerPopup from '../../ColorPickerPopup';
import type { useSettingsColors } from '../Hooks/UseSettingsColors';

const COLOR_TITLES = { signal_line: 'signalLine', display: 'display', bus: 'bus' };

const SettingsColors = ({
  colors,
  currentColorType,
  hasPendingColors,
  openColorPicker,
  closeColorPicker,
  applyColor,
  sendColors,
}: ReturnType<typeof useSettingsColors>) => {
  const { t } = useI18n();

  return (
    <>
      <div className="color-section">
        <h3 className="color-section-title">{t('settings.colors.heading')}</h3>
        <div className="color-buttons-list">
          {(Object.keys(colors) as ColorTarget[]).map((key) => (
            <button type="button" key={key} className="color-selection-btn" onClick={() => openColorPicker(key)}>
              <span className="color-label">{t(`settings.colors.${key === 'signal_line' ? 'signalLines' : key}`)}</span>
              <span className="color-dot" style={{ backgroundColor: colors[key].color }} />
            </button>
          ))}
        </div>
        <button type="button" className="send-colors-btn" onClick={sendColors} disabled={!hasPendingColors}>
          <span>{t('settings.actions.sendAllColors')}</span>
        </button>
      </div>
      {currentColorType && (
        <ColorPickerPopup
          visible
          title={t(`settings.colorPicker.${COLOR_TITLES[currentColorType]}`)}
          {...colors[currentColorType]}
          onClose={closeColorPicker}
          onApply={applyColor}
        />
      )}
    </>
  );
};

export default SettingsColors;
