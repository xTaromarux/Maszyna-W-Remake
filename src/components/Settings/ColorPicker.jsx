'use client';

import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/i18n';

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
const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

export function hsvToRgb(h, s, v) {
  const c = v * s,
    x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
    m = v - c;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
}
export function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    d = max - min;
  let h = d === 0 ? 0 : max === r ? 60 * (((g - b) / d) % 6) : max === g ? 60 * ((b - r) / d + 2) : 60 * ((r - g) / d + 4);
  if (h < 0) h += 360;
  return { h, s: max === 0 ? 0 : d / max, v: max };
}
export function rgbToHex({ r, g, b }) {
  return `#${[r, g, b].map((value) => Math.round(value).toString(16).padStart(2, '0')).join('')}`;
}
export function hexToRgb(hex) {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
  return match ? { r: parseInt(match[1], 16), g: parseInt(match[2], 16), b: parseInt(match[3], 16) } : null;
}
export function colorDataFromHSV(hsv, brightness) {
  const baseRgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
  const rgb = Object.fromEntries(Object.entries(baseRgb).map(([key, value]) => [key, Math.round(value * brightness)]));
  return { hex: rgbToHex(rgb), rgb, hsv: { ...hsv }, brightness, rgbScaled: rgb, pwm: rgb, baseRgb };
}

export default function ColorPicker({
  modelValue = '#ff00ff',
  size = 240,
  brightness = 1,
  onUpdateModelValue,
  onUpdateBrightness,
  onChange,
}) {
  const { t } = useI18n();
  const wheel = useRef(null);
  const picking = useRef(false);
  const callbacks = useRef({ onUpdateModelValue, onUpdateBrightness, onChange });
  callbacks.current = { onUpdateModelValue, onUpdateBrightness, onChange };
  const [hsv, setHsv] = useState(() => {
    const rgb = hexToRgb(modelValue) || { r: 255, g: 0, b: 255 };
    return rgbToHsv(rgb.r, rgb.g, rgb.b);
  });
  const [power, setPower] = useState(clamp01(brightness));
  const data = colorDataFromHSV(hsv, power);
  const hexPure = rgbToHex(hsvToRgb(hsv.h, hsv.s, 1));
  const angle = (hsv.h * Math.PI) / 180;
  const indicator = { x: size / 2 + (size / 2) * hsv.s * Math.cos(angle), y: size / 2 + (size / 2) * hsv.s * Math.sin(angle) };
  useEffect(() => {
    setPower(clamp01(brightness));
  }, [brightness]);
  useEffect(() => {
    const canvas = wheel.current;
    const scale = Math.min(window.devicePixelRatio || 1, 3);
    const width = Math.round(size * scale);
    canvas.width = width;
    canvas.height = width;
    const context = canvas.getContext('2d');
    if (!context) return;
    const pixels = context.createImageData(width, width);
    const center = width / 2,
      radius = width / 2 - 0.5;
    for (let y = 0; y < width; y++)
      for (let x = 0; x < width; x++) {
        const dx = x - center,
          dy = y - center,
          distance = Math.hypot(dx, dy),
          offset = (y * width + x) * 4;
        if (distance > radius) continue;
        const hue = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
        const rgb = hsvToRgb(hue, Math.min(1, distance / radius), 1);
        pixels.data[offset] = rgb.r;
        pixels.data[offset + 1] = rgb.g;
        pixels.data[offset + 2] = rgb.b;
        pixels.data[offset + 3] = 255;
      }
    context.putImageData(pixels, 0, 0);
  }, [size]);
  useEffect(() => {
    const value = colorDataFromHSV(hsv, power);
    callbacks.current.onUpdateModelValue?.(value.hex);
    callbacks.current.onUpdateBrightness?.(power);
    callbacks.current.onChange?.(value);
  }, [hsv, power]);
  const pick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = ((event.clientX - rect.left) / rect.width) * size - size / 2,
      dy = ((event.clientY - rect.top) / rect.height) * size - size / 2;
    setHsv((previous) => ({
      ...previous,
      h: ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360,
      s: Math.min(1, Math.hypot(dx, dy) / (size / 2)),
    }));
  };
  return (
    <div className="cp-root" data-component="ColorPicker" onDragStart={(event) => event.preventDefault()}>
      <div className="cp-wheel-wrap" style={{ width: size, height: size }}>
        <canvas ref={wheel} className="cp-wheel" style={{ width: size, height: size }} />
        <div className="cp-indicator" style={{ left: indicator.x, top: indicator.y, background: data.hex }} />
        <div
          className="cp-hitbox"
          onPointerDown={(event) => {
            event.preventDefault();
            picking.current = true;
            event.currentTarget.setPointerCapture?.(event.pointerId);
            pick(event);
          }}
          onPointerMove={(event) => {
            if (picking.current) pick(event);
          }}
          onPointerUp={(event) => {
            picking.current = false;
            if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          onPointerCancel={() => {
            picking.current = false;
          }}
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
          onChange={(event) => setHsv((previous) => ({ ...previous, v: Number(event.target.value) }))}
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
          onChange={(event) => setPower(clamp01(Number(event.target.value)))}
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
            onClick={() => {
              const rgb = hexToRgb(color);
              setPower(1);
              setHsv(rgbToHsv(rgb.r, rgb.g, rgb.b));
            }}
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
}
