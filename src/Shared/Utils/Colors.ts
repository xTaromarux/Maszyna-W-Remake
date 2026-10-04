import type { ColorData, HSV, RGB } from '@/Types/Colors';
export function hsvToRgb(h: number, s: number, v: number): RGB {
  const c = v * s,
    x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
    m = v - c;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
}
export function rgbToHsv(r: number, g: number, b: number): HSV {
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
export function rgbToHex({ r, g, b }: RGB): string {
  return `#${[r, g, b].map((value) => Math.round(value).toString(16).padStart(2, '0')).join('')}`;
}
export function hexToRgb(hex: string | null | undefined): RGB | null {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
  return match ? { r: parseInt(match[1], 16), g: parseInt(match[2], 16), b: parseInt(match[3], 16) } : null;
}
export function colorDataFromHSV(hsv: HSV, brightness: number): ColorData {
  const baseRgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
  const rgb: RGB = { r: Math.round(baseRgb.r * brightness), g: Math.round(baseRgb.g * brightness), b: Math.round(baseRgb.b * brightness) };
  return { hex: rgbToHex(rgb), rgb, hsv: { ...hsv }, brightness, rgbScaled: rgb, pwm: rgb, baseRgb };
}
