'use client';

import type { SignalButtonProps } from '@/types/components';
export default function SignalButton({
  id,
  signal,
  label,
  divClassNames = '',
  spanClassNames = '',
  className = '',
  onClick,
  style,
}: SignalButtonProps) {
  return (
    <div
      id={id}
      className={['signal', 'impulse', divClassNames, className, signal ? 'active' : ''].filter(Boolean).join(' ')}
      style={style}
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-pressed={Boolean(signal)}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick?.(event);
        }
      }}
    >
      <span className={spanClassNames}>{label}</span>
    </div>
  );
}
