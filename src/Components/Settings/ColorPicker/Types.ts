import type { ColorData, ColorSelection } from '../../../Shared/Types/Colors';
import type { Action, Update } from '../../../Shared/Types/Common';

export interface ColorPickerContentProps {
  title?: string;
  color: string;
  brightness: number;
  colorData?: ColorData;
  onClose?: Action;
  onApply?: Update<ColorSelection>;
}

export type ColorPickerPopupProps = Partial<Pick<ColorPickerContentProps, 'color' | 'brightness'>> &
  Omit<ColorPickerContentProps, 'color' | 'brightness'> & { visible?: boolean };

export interface ColorPickerProps {
  modelValue?: string;
  size?: number;
  brightness?: number;
  onUpdateModelValue?: Update<string>;
  onUpdateBrightness?: Update<number>;
  onChange?: Update<ColorData>;
}
