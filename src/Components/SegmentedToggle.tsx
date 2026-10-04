'use client';

import { useI18n } from '@/I18n/Index';
import type { SegmentedToggleProps, ToggleOption, ToggleValue } from '@/Types/Components';
import type { KeyboardEvent } from 'react';
import { useRef } from 'react';

const SegmentedToggle = <T extends ToggleValue>({
  options,
  modelValue = null,
  ariaLabel,
  valueKey = 'value',
  labelKey = 'label',
  onUpdateModelValue,
  onChange,
  renderOption,
  className = '',
  style,
  ...rest
}: SegmentedToggleProps<T>) => {
  const { t } = useI18n();
  const root = useRef<HTMLDivElement | null>(null);
  const valueOf = (option: ToggleOption<T>): T => (option !== null && typeof option === 'object' ? option[valueKey] : option);
  const activeIndex = modelValue == null ? -1 : options.findIndex((option) => valueOf(option) === modelValue);
  const tabStopIndex = activeIndex < 0 ? 0 : activeIndex;

  const optionLabel = (option: ToggleOption<T>, index: number) => {
    if (renderOption) {
      return renderOption(option, index);
    }
    if (option !== null && typeof option === 'object') {
      return option[labelKey];
    }
    return String(option);
  };

  const select = (option: ToggleOption<T>) => {
    const value = valueOf(option);
    onUpdateModelValue?.(value);
    onChange?.(value);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const next = (index + (event.key === 'ArrowLeft' ? -1 : 1) + options.length) % options.length;
      root.current?.querySelectorAll<HTMLButtonElement>('.seg-btn')[next]?.focus();
    }
  };

  return (
    <div
      data-editor-segmented-toggle=""
      {...rest}
      ref={root}
      className={`segmented ${className}`}
      style={{ '--count': String(options.length), '--idx': String(activeIndex), ...style }}
    >
      <div data-editor-segmented-toggle="" className="track" role="tablist" aria-label={ariaLabel || t('common.segmentedToggle.aria')}>
        {activeIndex >= 0 && <div data-editor-segmented-toggle="" className="thumb" aria-hidden="true" />}
        {options.map((option, index) => (
          <button
            data-editor-segmented-toggle=""
            key={String(valueOf(option) ?? index)}
            type="button"
            className="seg-btn"
            role="tab"
            aria-selected={index === activeIndex}
            tabIndex={index === tabStopIndex ? 0 : -1}
            onClick={() => select(option)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {optionLabel(option, index)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SegmentedToggle;
