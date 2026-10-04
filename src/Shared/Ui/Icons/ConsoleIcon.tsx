import type { IconProps } from '@/Shared/Types/React';

const ConsoleIcon = ({ hasError = false, className = '', ...props }: IconProps) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`console-icon ${hasError ? 'error-state' : ''} ${className}`}
      {...props}
    >
      <rect x="2" y="4" width="20" height="16" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
      <path d="M2 8h20" stroke="currentColor" strokeWidth="2" />
      {[5, 7, 9].map((cx) => (
        <circle key={cx} cx={cx} cy="6" r="0.5" fill="currentColor" />
      ))}
      <path d="m6 12 2 2-2 2m4-2h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default ConsoleIcon;
