import type { ColorData, HSV, RGB } from '@/Shared/Types/Colors';

const HEX_COLOR_PATTERN = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;

export const hsvToRgb = (hue: number, saturation: number, value: number): RGB => {
  const chroma = value * saturation;
  const intermediateComponent = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const matchOffset = value - chroma;

  let red: number;
  let green: number;
  let blue: number;

  if (hue < 60) {
    red = chroma;
    green = intermediateComponent;
    blue = 0;
  } else if (hue < 120) {
    red = intermediateComponent;
    green = chroma;
    blue = 0;
  } else if (hue < 180) {
    red = 0;
    green = chroma;
    blue = intermediateComponent;
  } else if (hue < 240) {
    red = 0;
    green = intermediateComponent;
    blue = chroma;
  } else if (hue < 300) {
    red = intermediateComponent;
    green = 0;
    blue = chroma;
  } else {
    red = chroma;
    green = 0;
    blue = intermediateComponent;
  }

  return {
    r: Math.round((red + matchOffset) * 255),
    g: Math.round((green + matchOffset) * 255),
    b: Math.round((blue + matchOffset) * 255),
  };
};

export const rgbToHsv = (r: number, g: number, b: number): HSV => {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);
  const chroma = maximum - minimum;

  let hue: number;
  if (chroma === 0) {
    hue = 0;
  } else if (maximum === red) {
    hue = 60 * (((green - blue) / chroma) % 6);
  } else if (maximum === green) {
    hue = 60 * ((blue - red) / chroma + 2);
  } else {
    hue = 60 * ((red - green) / chroma + 4);
  }

  if (hue < 0) {
    hue += 360;
  }

  return {
    h: hue,
    s: maximum === 0 ? 0 : chroma / maximum,
    v: maximum,
  };
};

export const rgbToHex = ({ r, g, b }: RGB): string =>
  `#${[r, g, b].map((value) => Math.round(value).toString(16).padStart(2, '0')).join('')}`;

export const hexToRgb = (hex: string | null | undefined): RGB | null => {
  const match = HEX_COLOR_PATTERN.exec(hex || '');
  if (!match) {
    return null;
  }

  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
  };
};

export const colorDataFromHSV = (hsv: HSV, brightness: number): ColorData => {
  const baseRgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
  const rgb: RGB = {
    r: Math.round(baseRgb.r * brightness),
    g: Math.round(baseRgb.g * brightness),
    b: Math.round(baseRgb.b * brightness),
  };

  return {
    hex: rgbToHex(rgb),
    rgb,
    hsv: { ...hsv },
    brightness,
    rgbScaled: rgb,
    pwm: rgb,
    baseRgb,
  };
};
