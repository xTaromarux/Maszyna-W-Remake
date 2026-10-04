import type { CSSProperties, HTMLAttributes, ReactNode, SVGProps } from 'react';

export type NumberFormat = 'dec' | 'hex' | 'bin';
export type RadixFormat = Exclude<NumberFormat, 'dec'>;
export type Locale = 'pl' | 'en';
export type Update<T> = (value: T) => void;
export type Action = () => void;
export type Timer = ReturnType<typeof setTimeout>;
export type Translator = (key: string, params?: Record<string, unknown>) => string;
export type DivProps = Omit<HTMLAttributes<HTMLDivElement>, 'onChange'>;
export type IconProps = SVGProps<SVGSVGElement> & { hasError?: boolean; fillColor?: string; strokeColor?: string };
export interface ChildrenProps { children: ReactNode }
export interface ErrorPageProps { error?: Error & { digest?: string }; reset: Action }
export type StyledProperties = CSSProperties & { [key: `--${string}`]: string | number };
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue | undefined };
