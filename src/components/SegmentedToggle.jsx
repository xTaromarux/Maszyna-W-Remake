'use client';

import { useRef } from 'react';
import { useI18n } from '@/i18n';

export default function SegmentedToggle({ options, modelValue = null, ariaLabel, valueKey = 'value', labelKey = 'label', onUpdateModelValue, onChange, renderOption, className = '', style, ...rest }) {
  const { t } = useI18n();
  const root = useRef(null);
  const valueOf = (option) => option !== null && typeof option === 'object' ? option[valueKey] : option;
  const activeIndex = modelValue == null ? -1 : options.findIndex((option) => valueOf(option) === modelValue);
  const select = (option) => {
    const value = valueOf(option);
    onUpdateModelValue?.(value);
    onChange?.(value);
  };
  const onKeyDown = (event, option, index) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const next = (index + (event.key === 'ArrowLeft' ? -1 : 1) + options.length) % options.length;
      root.current?.querySelectorAll('.seg-btn')[next]?.focus();
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      select(option);
    }
  };

  return <div data-editor-segmented-toggle="" {...rest} ref={root} className={`segmented ${className}`} style={{ '--count': String(options.length), '--idx': String(activeIndex), ...style }}>
    <div data-editor-segmented-toggle="" className="track" role="tablist" aria-label={ariaLabel || t('common.segmentedToggle.aria')}>
      {activeIndex >= 0 && <div data-editor-segmented-toggle="" className="thumb" aria-hidden="true" />}
      {options.map((option, index) => <button data-editor-segmented-toggle="" key={String(valueOf(option) ?? index)} type="button" className="seg-btn" role="tab" aria-selected={index === activeIndex} tabIndex={index === activeIndex ? 0 : -1} onClick={() => select(option)} onKeyDown={(event) => onKeyDown(event, option, index)}>
        {renderOption ? renderOption(option, index) : option !== null && typeof option === 'object' ? option[labelKey] : String(option)}
      </button>)}
    </div>
  </div>;
}
