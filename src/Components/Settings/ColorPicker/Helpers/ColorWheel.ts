import { hsvToRgb } from '@/Shared/Utils/Colors';

export const calculateWheelSelection = (x: number, y: number, width: number, height: number) => {
  const horizontal = x / width - 0.5;
  const vertical = y / height - 0.5;

  return {
    h: ((Math.atan2(vertical, horizontal) * 180) / Math.PI + 360) % 360,
    s: Math.min(1, Math.hypot(horizontal, vertical) * 2),
  };
};

export const drawColorWheel = (canvas: HTMLCanvasElement, size: number, pixelRatio: number) => {
  const width = Math.round(size * Math.min(pixelRatio || 1, 3));
  canvas.width = width;
  canvas.height = width;

  const context = canvas.getContext('2d');
  if (!context) {
    return;
  }

  const pixels = context.createImageData(width, width);
  const center = width / 2;
  const radius = center - 0.5;

  for (let y = 0; y < width; y++) {
    for (let x = 0; x < width; x++) {
      const horizontal = x - center;
      const vertical = y - center;
      const distance = Math.hypot(horizontal, vertical);
      if (distance > radius) {
        continue;
      }

      const hue = ((Math.atan2(vertical, horizontal) * 180) / Math.PI + 360) % 360;
      const rgb = hsvToRgb(hue, Math.min(1, distance / radius), 1);
      const offset = (y * width + x) * 4;

      pixels.data[offset] = rgb.r;
      pixels.data[offset + 1] = rgb.g;
      pixels.data[offset + 2] = rgb.b;
      pixels.data[offset + 3] = 255;
    }
  }

  context.putImageData(pixels, 0, 0);
};
