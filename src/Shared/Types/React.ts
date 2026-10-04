import type { CSSProperties, HTMLAttributes, ReactNode, SVGProps } from 'react';
import type { Action } from './Common';

export type SvgChildrenProps = ChildrenProps & Pick<IconProps, 'fill' | 'stroke'>;

export type DivProps = Omit<HTMLAttributes<HTMLDivElement>, 'onChange'>;

export type IconProps = SVGProps<SVGSVGElement> & { hasError?: boolean; fillColor?: string; strokeColor?: string };

export interface ChildrenProps {
  children: ReactNode;
}

export interface ErrorPageProps {
  error?: Error & { digest?: string };
  retry: Action;
}

export type StyledProperties = CSSProperties & { [key: `--${string}`]: string | number };
