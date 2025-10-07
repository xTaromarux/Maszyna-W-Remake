
export enum ErrorLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}
export const ErrorLevelColor: Record<ErrorLevel, string> = {
  [ErrorLevel.INFO]: '#3b82f6',
  [ErrorLevel.WARNING]: '#f59e0b',
  [ErrorLevel.ERROR]: '#ef4444',
  [ErrorLevel.CRITICAL]: '#b91c1c',
};
export function getErrorColor(level: ErrorLevel): string {
  return ErrorLevelColor[level];
}
export interface BaseErrorData<TCode extends string = string, TExtra = unknown> {
  message: string;
  level: ErrorLevel;
  timestamp: string; // ISO 8601
  code?: TCode;
  hint?: string;
  context?: TExtra;
}
export type BaseErrorOptions<TCode extends string = string, TExtra = unknown> = Partial<
  Omit<BaseErrorData<TCode, TExtra>, 'message' | 'level' | 'timestamp'>
> & {
  level?: ErrorLevel;
  timestamp?: string | Date;
};
export class BaseAppError<TCode extends string = string, TExtra = unknown> extends Error implements BaseErrorData<TCode, TExtra> {
  readonly level: ErrorLevel;
  readonly timestamp: string;
  readonly code?: TCode;
  readonly hint?: string;
  readonly context?: TExtra;
  constructor(message: string, options?: BaseErrorOptions<TCode, TExtra>) {
    super(message);
    this.name = 'AppError';
    this.level = options?.level ?? ErrorLevel.ERROR;
    this.code = options?.code as TCode | undefined;
    this.hint = options?.hint;
    this.context = options?.context as TExtra | undefined;
    const ts = options?.timestamp;
    this.timestamp = ts ? (ts instanceof Date ? ts.toISOString() : new Date(ts).toISOString()) : new Date().toISOString();
    Object.setPrototypeOf(this, new.target.prototype);
  }
  get color(): string {
    return getErrorColor(this.level);
  }
}
export type ErrorFactory<TCode extends string = string, TExtra = unknown> = (
  message: string,
  options?: BaseErrorOptions<TCode, TExtra>
) => BaseAppError<TCode, TExtra>;
export function createErrorFactory<TCode extends string = string, TExtra = unknown>(
  defaults?: Partial<BaseErrorOptions<TCode, TExtra>> & { defaultLevel?: ErrorLevel }
): ErrorFactory<TCode, TExtra> {
  return (message, options) => {
    const level = options?.level ?? defaults?.level ?? defaults?.defaultLevel ?? ErrorLevel.ERROR;
    return new BaseAppError<TCode, TExtra>(message, { ...defaults, ...options, level });
  };
}
export type { ErrorLevel as Level };