'use client';

import KogWheelIcon from '@/Shared/Ui/Icons/KogWheelIcon';
import type { NumberFormat } from '@/Shared/Types/Numbers';
import { useEffect, useRef, useState } from 'react';

interface RegisterFormatSelectorProps {
  label: string;
  numberFormat: NumberFormat;
  onChange?: (format: NumberFormat) => void;
}

const NUMBER_FORMATS = ['dec', 'hex', 'bin'] as const;

/** Offers number formats and restores the opener's focus after selection or Escape. */
const RegisterFormatSelector = ({ label, numberFormat, onChange }: RegisterFormatSelectorProps) => {
  const root = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  const closeAndRestoreFocus = () => {
    setOpen(false);
    opener.current?.focus();
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const closeOutside = (event: MouseEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && event.target instanceof Node && root.current?.contains(event.target)) {
        event.preventDefault();
        setOpen(false);
        opener.current?.focus();
      }
    };

    document.addEventListener('click', closeOutside);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('click', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const selectFormat = (format: NumberFormat) => {
    onChange?.(format);
    closeAndRestoreFocus();
  };

  return (
    <div className="format-selector" ref={root}>
      <button
        ref={opener}
        type="button"
        className="format-button"
        aria-label={`${label}: DEC / HEX / BIN`}
        aria-expanded={open}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((previous) => !previous);
        }}
      >
        <KogWheelIcon />
      </button>
      {open && (
        <div className="format-menu">
          {NUMBER_FORMATS.map((format) => (
            <button
              key={format}
              type="button"
              aria-pressed={numberFormat === format}
              className={numberFormat === format ? 'active' : ''}
              onClick={() => selectFormat(format)}
            >
              {format.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RegisterFormatSelector;
