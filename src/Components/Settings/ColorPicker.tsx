'use client';

import { useI18n } from '@/I18n/Index';
import { hsvToRgb, rgbToHex } from '@/Shared/Utils/Colors';
import type { ColorPickerProps } from '@/Types/Components';
import { useColorSelection } from './ColorPicker/Hooks/UseColorSelection';
import { useColorWheel } from './ColorPicker/Hooks/UseColorWheel';

const SWATCHES = [
  '#ffffff',
  '#000000',
  '#ff0000',
  '#ffa500',
  '#ffff00',
  '#00ff00',
  '#00ffff',
  '#0000ff',
  '#ff00ff',
  '#c0c0c0',
  '#808080',
  '#8b4513',
  '#ff69b4',
  '#7fff00',
  '#40e0d0',
  '#8a2be2',
];
const ColorPicker = ({
  modelValue = '#ff00ff',
  size = 240,
  brightness = 1,
  onUpdateModelValue,
  onUpdateBrightness,
  onChange,
}: ColorPickerProps) => {
  const { t } = useI18n();
  const { hsv, power, data, selectWheelColor, updateColorBrightness, updateLedBrightness, selectSwatch } = useColorSelection({
    modelValue,
    brightness,
    onUpdateModelValue,
    onUpdateBrightness,
    onChange,
  });
  const { canvas, startPicking, continuePicking, stopPicking } = useColorWheel({ size, onSelect: selectWheelColor });
  const hexPure = rgbToHex(hsvToRgb(hsv.h, hsv.s, 1));
  const angle = (hsv.h * Math.PI) / 180;
  const indicator = { x: size / 2 + (size / 2) * hsv.s * Math.cos(angle), y: size / 2 + (size / 2) * hsv.s * Math.sin(angle) };

  return (
    <div className="cp-root" data-component="ColorPicker" onDragStart={(event) => event.preventDefault()}>
      <div className="cp-wheel-wrap" style={{ width: size, height: size }}>
        <canvas ref={canvas} className="cp-wheel" style={{ width: size, height: size }} />
        <div className="cp-indicator" style={{ left: indicator.x, top: indicator.y, background: data.hex }} />
        <div
          className="cp-hitbox"
          onPointerDown={startPicking}
          onPointerMove={continuePicking}
          onPointerUp={stopPicking}
          onPointerCancel={stopPicking}
          onLostPointerCapture={stopPicking}
        />
      </div>
      <div className="cp-section">
        <div className="cp-label">{t('colorPicker.colorBrightness')}</div>
        <div className="cp-bar" style={{ background: `linear-gradient(90deg, #000, ${hexPure})` }} />
        <input
          className="cp-range"
          type="range"
          aria-label={t('colorPicker.colorBrightness')}
          min="0"
          max="1"
          step="0.001"
          value={hsv.v}
          onChange={(event) => updateColorBrightness(Number(event.target.value))}
        />
        <div className="cp-mini">{Math.round(hsv.v * 100)}%</div>
      </div>
      <div className="cp-section">
        <div className="cp-label">{t('colorPicker.ledBrightness')}</div>
        <div className="cp-bar cp-bar-grey" />
        <input
          className="cp-range"
          type="range"
          aria-label={t('colorPicker.ledBrightness')}
          min="0"
          max="1"
          step="0.001"
          value={power}
          onChange={(event) => updateLedBrightness(Number(event.target.value))}
        />
        <div className="cp-mini">{Math.round(power * 100)}%</div>
      </div>
      <div className="cp-swatches">
        {SWATCHES.map((color) => (
          <button
            type="button"
            key={color}
            className="cp-swatch"
            style={{ background: color }}
            aria-label={color}
            onClick={() => selectSwatch(color)}
          />
        ))}
      </div>
      <div className="cp-readout">
        <div className="cp-current" style={{ background: data.hex }} />
        <div className="cp-text">
          <div className="cp-line">{data.hex}</div>
          <div className="cp-line">
            rgb({data.rgb.r}, {data.rgb.g}, {data.rgb.b})
          </div>
          <div className="cp-line">
            hsv({hsv.h.toFixed(0)}, {Math.round(hsv.s * 100)}%, {Math.round(hsv.v * 100)}%)
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
