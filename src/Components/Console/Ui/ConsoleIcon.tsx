import type { SvgChildrenProps } from '@/Types/Components';

type Props = SvgChildrenProps & {
  size?: number;
  scope?: 'console' | 'dock';
};

const ConsoleIcon = ({ children, size = 16, scope = 'console', fill = 'none', stroke = 'currentColor' }: Props) => (
  <svg
    data-editor-console={scope === 'console' ? '' : undefined}
    data-editor-console-dock={scope === 'dock' ? '' : undefined}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={stroke}
    strokeWidth="2"
    aria-hidden="true"
  >
    {children}
  </svg>
);

export default ConsoleIcon;
