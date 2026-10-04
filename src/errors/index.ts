import type { ErrorFactoryDefaults } from '@/types/errors';
import type { BaseErrorData, BaseErrorOptions, ErrorFactory } from '../types/errors';
import { ErrorLevel } from '../types/errors';
// Generic error shell for the app. Other domains should extend this.

export const ErrorLevelColor: Record<ErrorLevel, string> = {
  [ErrorLevel.INFO]: '#3b82f6',
  [ErrorLevel.WARNING]: '#f59e0b',
  [ErrorLevel.ERROR]: '#ef4444',
  [ErrorLevel.CRITICAL]: '#b91c1c',
};

export function getErrorColor(level: ErrorLevel): string {
  return ErrorLevelColor[level];
}

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

// Lightweight factory with generics to constrain error creation to specific code/extra shapes

export function createErrorFactory<TCode extends string = string, TExtra = unknown>(
  defaults?: ErrorFactoryDefaults<TCode, TExtra>
): ErrorFactory<TCode, TExtra> {
  return (message, options) => {
    const level = options?.level ?? defaults?.level ?? defaults?.defaultLevel ?? ErrorLevel.ERROR;
    return new BaseAppError<TCode, TExtra>(message, { ...defaults, ...options, level });
  };
}
