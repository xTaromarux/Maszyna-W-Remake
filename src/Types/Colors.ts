export interface RGB {
  r: number;
  g: number;
  b: number;
}
export interface HSV {
  h: number;
  s: number;
  v: number;
}
export interface ColorData {
  hex: string;
  rgb: RGB;
  hsv: HSV;
  brightness: number;
  rgbScaled: RGB;
  pwm: RGB;
  baseRgb: RGB;
}
export type ColorTarget = 'signal_line' | 'display' | 'bus';
export interface ColorSelection {
  color: string;
  brightness: number;
  colorData: ColorData;
}
export interface ColorUpdate extends Pick<ColorData, 'hex' | 'rgb' | 'hsv' | 'brightness' | 'rgbScaled'> {
  type: `${ColorTarget}_hex`;
}

export type SavedColor = Pick<ColorSelection, 'color' | 'brightness'> & Partial<Pick<ColorSelection, 'colorData'>>;
