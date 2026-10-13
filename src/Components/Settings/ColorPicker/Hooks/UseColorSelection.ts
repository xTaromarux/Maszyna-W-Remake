import { colorDataFromHSV, hexToRgb, rgbToHsv } from '@/Shared/Utils/Colors';
import { clamp01 } from '@/Shared/Utils/Numbers';
import type { ColorPickerProps } from '@/Components/Settings/ColorPicker/Types';
import { useEffect, useRef, useState } from 'react';

const parseColor = (color: string) => {
  const rgb = hexToRgb(color) ?? { r: 255, g: 0, b: 255 };
  return rgbToHsv(rgb.r, rgb.g, rgb.b);
};

/** Maintains HSV and LED brightness, synchronizes external values, and publishes the selected color. */
export const useColorSelection = ({
  modelValue = '#ff00ff',
  brightness = 1,
  onUpdateModelValue,
  onUpdateBrightness,
  onChange,
}: ColorPickerProps) => {
  const [hsv, setHsv] = useState(() => parseColor(modelValue));
  const [power, setPower] = useState(() => clamp01(brightness));
  const lastPublishedColor = useRef<string | null>(null);
  const callbacks = useRef({ onUpdateModelValue, onUpdateBrightness, onChange });
  callbacks.current = { onUpdateModelValue, onUpdateBrightness, onChange };

  useEffect(() => {
    // The published hex already includes LED power; a parent echo must not apply it again.
    if (modelValue.toLowerCase() === lastPublishedColor.current) {
      return;
    }

    const next = parseColor(modelValue);
    setHsv((previous) => (previous.h === next.h && previous.s === next.s && previous.v === next.v ? previous : next));
  }, [modelValue]);

  useEffect(() => {
    setPower(clamp01(brightness));
  }, [brightness]);

  useEffect(() => {
    const color = colorDataFromHSV(hsv, power);
    lastPublishedColor.current = color.hex.toLowerCase();
    callbacks.current.onUpdateModelValue?.(color.hex);
    callbacks.current.onUpdateBrightness?.(power);
    callbacks.current.onChange?.(color);
  }, [hsv, power]);

  const selectWheelColor = (selection: { h: number; s: number }) => {
    setHsv((previous) => ({ ...previous, ...selection }));
  };

  const updateColorBrightness = (value: number) => {
    setHsv((previous) => ({ ...previous, v: clamp01(value) }));
  };

  const updateLedBrightness = (value: number) => {
    setPower(clamp01(value));
  };

  const selectSwatch = (color: string) => {
    if (!hexToRgb(color)) {
      return;
    }

    setPower(1);
    setHsv(parseColor(color));
  };

  return {
    hsv,
    power,
    data: colorDataFromHSV(hsv, power),
    selectWheelColor,
    updateColorBrightness,
    updateLedBrightness,
    selectSwatch,
  };
};
