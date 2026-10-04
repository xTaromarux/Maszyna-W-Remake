'use client';

import type { SignalButtonProps } from '@/Components/ProcessorDiagram/Types';
import type { KeyboardEvent } from 'react';

const SignalButton = ({
  id,
  signal,
  label,
  divClassNames = '',
  spanClassNames = '',
  className = '',
  onClick,
  style,
}: SignalButtonProps) => {
  const classes = ['signal', 'impulse', divClassNames, className, signal ? 'active' : ''].filter(Boolean).join(' ');

  // Keep the diagram wrapper while providing the keyboard activation of a button.
  const activateFromKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    onClick?.(event);
  };

  return (
    <div
      id={id}
      className={classes}
      style={style}
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-pressed={Boolean(signal)}
      onClick={onClick}
      onKeyDown={activateFromKeyboard}
    >
      <span className={spanClassNames}>{label}</span>
    </div>
  );
};

export default SignalButton;
