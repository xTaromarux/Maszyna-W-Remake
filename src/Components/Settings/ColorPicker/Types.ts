import type { ColorData } from '@/Shared/Types/Colors';
import type { Update } from '@/Shared/Types/Common';

export interface ColorPickerProps {
  modelValue?: string;
  size?: number;
  brightness?: number;
  onUpdateModelValue?: Update<string>;
  onUpdateBrightness?: Update<number>;
  onChange?: Update<ColorData>;
}
