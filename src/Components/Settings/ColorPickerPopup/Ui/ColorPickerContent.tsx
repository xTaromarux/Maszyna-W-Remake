import { useI18n } from '@/I18n/Index';
import { useModalFocus } from '@/Shared/Hooks/UseModalFocus';
import { colorDataFromHSV, hexToRgb, rgbToHex, rgbToHsv } from '@/Shared/Utils/Colors';
import type { ColorPickerContentProps } from '@/Types/Components';
import { useState } from 'react';
import ColorPicker from '../../ColorPicker';

const ColorPickerContent = ({ title, color, brightness, colorData, onClose, onApply }: ColorPickerContentProps) => {
  const { t } = useI18n();
  const dialog = useModalFocus(true, onClose);
  const [selection, setSelection] = useState(() => {
    const rgb = hexToRgb(color) || { r: 255, g: 0, b: 0 };
    return colorData || colorDataFromHSV(rgbToHsv(rgb.r, rgb.g, rgb.b), brightness);
  });

  // Saved hex includes LED power; recover its original base before reopening the picker.
  const baseColor = colorData?.baseRgb ? rgbToHex(colorData.baseRgb) : color;

  const applySelection = () => {
    onApply?.({ color: selection.hex, brightness: selection.brightness, colorData: selection });
    onClose?.();
  };

  return (
    <div
      data-component="ColorPickerPopup"
      className="color-popup-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div className="color-popup" ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}>
        <div className="color-popup-header">
          <h3>{title}</h3>
          <button type="button" className="close-btn" onClick={onClose} aria-label={t('settings.actions.close')}>
            &times;
          </button>
        </div>
        <div className="color-popup-content">
          <ColorPicker modelValue={baseColor} brightness={brightness} size={260} onChange={setSelection} />
          <div className="color-preview">
            <div className="preview-box" style={{ backgroundColor: selection.hex }} />
            <div className="color-info">
              <span>{selection.hex}</span>
              <span>
                {t('colorPickerPopup.brightness')}: {Math.round(selection.brightness * 100)}%
              </span>
            </div>
          </div>
        </div>
        <div className="color-popup-footer">
          <button type="button" className="cancel-btn" onClick={onClose}>
            {t('actions.cancel')}
          </button>
          <button type="button" className="apply-btn" onClick={applySelection}>
            {t('actions.apply')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColorPickerContent;
