import type { BaseAppError } from '../Errors/Index';

export enum ErrorLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
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

export type ErrorFactory<TCode extends string = string, TExtra = unknown> = (
  message: string,
  options?: BaseErrorOptions<TCode, TExtra>
) => BaseAppError<TCode, TExtra>;

export type ErrorFactoryDefaults<TCode extends string = string, TExtra = unknown> = Partial<BaseErrorOptions<TCode, TExtra>> & {
  defaultLevel?: ErrorLevel;
};
