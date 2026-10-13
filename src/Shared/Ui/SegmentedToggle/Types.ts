import type { ReactNode } from 'react';
import type { DivProps } from '../../Types/React';
import type { Update } from '../../Types/Common';

export type ToggleValue = string | boolean | number;

export type ToggleOption<T extends ToggleValue> = T | { value: T; label: ReactNode };

export interface SegmentedToggleProps<T extends ToggleValue> extends DivProps {
  valueKey?: 'value';
  labelKey?: 'label';
  options: ToggleOption<T>[];
  modelValue?: T | null;
  ariaLabel?: string;
  onUpdateModelValue?: Update<T>;
  onChange?: Update<T>;
  renderOption?: (option: ToggleOption<T>, index: number) => ReactNode;
}
