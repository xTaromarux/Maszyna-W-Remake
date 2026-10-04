'use client';

import type { ColorPickerPopupProps } from '@/Types/Components';
import { createPortal } from 'react-dom';
import ColorPickerContent from './ColorPickerPopup/Ui/ColorPickerContent';

const ColorPickerPopup = ({ visible = false, color = '#ff0000', brightness = 1, ...props }: ColorPickerPopupProps) => {
  if (!visible || typeof document === 'undefined') {
    return null;
  }

  return createPortal(<ColorPickerContent color={color} brightness={brightness} {...props} />, document.body);
};

export default ColorPickerPopup;
