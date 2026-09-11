'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '@/i18n';
import ColorPicker, { hexToRgb, rgbToHsv, rgbToHex, colorDataFromHSV } from './ColorPicker';

function ColorPickerContent({ title, color, brightness, colorData, onClose, onApply }) {
  const { t } = useI18n();
  const [localColor, setLocalColor] = useState(color);
  const [localBrightness, setLocalBrightness] = useState(brightness);
  const [currentData, setCurrentData] = useState(
    () => colorData || colorDataFromHSV(rgbToHsv(...Object.values(hexToRgb(color) || { r: 255, g: 0, b: 0 })), brightness)
  );
  // Saved hex already contains LED power; recover its base color when reopening.
  const baseColor = colorData?.baseRgb ? rgbToHex(colorData.baseRgb) : color;
  return (
    <div
      data-component="ColorPickerPopup"
      className="color-popup-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          onClose?.();
        }
      }}
    >
      <div className="color-popup" role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()}>
        <div className="color-popup-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onClose} aria-label={t('settings.actions.close')}>
            &times;
          </button>
        </div>
        <div className="color-popup-content">
          <ColorPicker
            modelValue={baseColor}
            brightness={brightness}
            size={260}
            onUpdateModelValue={setLocalColor}
            onUpdateBrightness={setLocalBrightness}
            onChange={setCurrentData}
          />
          <div className="color-preview">
            <div className="preview-box" style={{ backgroundColor: localColor }} />
            <div className="color-info">
              <span>{localColor}</span>
              <span>
                {t('colorPickerPopup.brightness')}: {Math.round(localBrightness * 100)}%
              </span>
            </div>
          </div>
        </div>
        <div className="color-popup-footer">
          <button className="cancel-btn" onClick={onClose}>
            {t('actions.cancel')}
          </button>
          <button
            className="apply-btn"
            onClick={() => {
              onApply?.({ color: localColor, brightness: localBrightness, colorData: currentData });
              onClose?.();
            }}
          >
            {t('actions.apply')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ColorPickerPopup({ visible = false, color = '#ff0000', brightness = 1, ...props }) {
  if (!visible || typeof document === 'undefined') return null;
  return createPortal(<ColorPickerContent color={color} brightness={brightness} {...props} />, document.body);
}
