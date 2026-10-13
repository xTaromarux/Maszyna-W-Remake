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

export interface ColorSelection {
  color: string;
  brightness: number;
  colorData: ColorData;
}
