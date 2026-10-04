import type { ColorSelection } from '@/Shared/Types/Colors';
import type { ColorTarget } from '@/Machine/Types/EspColors';
import type { SavedColor, PendingColor, SettingsPanelProps } from '@/Components/Settings/Types';

import { useState } from 'react';

const INITIAL_COLORS: Record<ColorTarget, SavedColor> = {
  signal_line: { color: '#ff0000', brightness: 1 },
  display: { color: '#00ff00', brightness: 1 },
  bus: { color: '#0000ff', brightness: 1 },
};

/** Keeps color drafts separate from device updates and publishes pending selections on demand. */
export const useSettingsColors = (onColorChange: SettingsPanelProps['onColorChange']) => {
  const [colors, setColors] = useState(INITIAL_COLORS);
  const [pendingColors, setPendingColors] = useState<Partial<Record<ColorTarget, PendingColor>>>({});
  const [currentColorType, setCurrentColorType] = useState<ColorTarget | null>(null);

  const closeColorPicker = () => setCurrentColorType(null);

  const applyColor = (selection: ColorSelection) => {
    if (!currentColorType) {
      return;
    }

    const target = currentColorType;
    setColors((previous) => ({ ...previous, [target]: selection }));
    setPendingColors((previous) => ({ ...previous, [target]: { ...selection, type: `${target}_hex` } }));
    closeColorPicker();
  };

  const sendColors = () => {
    for (const { type, brightness, colorData } of Object.values(pendingColors)) {
      onColorChange?.({
        type,
        hex: colorData.hex,
        rgb: colorData.rgb,
        hsv: colorData.hsv,
        brightness,
        rgbScaled: colorData.rgbScaled,
      });
    }

    setPendingColors({});
  };

  return {
    colors,
    currentColorType,
    hasPendingColors: Object.keys(pendingColors).length > 0,
    openColorPicker: setCurrentColorType,
    closeColorPicker,
    applyColor,
    sendColors,
  };
};
