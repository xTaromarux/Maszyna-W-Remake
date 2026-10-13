import type { ColorData } from '../../Shared/Types/Colors';

export type ColorTarget = 'signal_line' | 'display' | 'bus';

export interface ColorUpdate extends Pick<ColorData, 'hex' | 'rgb' | 'hsv' | 'brightness' | 'rgbScaled'> {
  type: `${ColorTarget}_hex`;
}
