import { ErrorLevel } from '@/Types/Errors';
import type { LogEntry } from '@/Types/Simulator';

const padDatePart = (number: number) => String(number).padStart(2, '0');

export const formatTimestamp = (timestamp: string | Date) => {
  const date = new Date(timestamp);
  const time = [padDatePart(date.getHours()), padDatePart(date.getMinutes()), padDatePart(date.getSeconds())].join(':');

  if (date.toDateString() === new Date().toDateString()) {
    return time;
  }

  return `${[date.getFullYear(), padDatePart(date.getMonth() + 1), padDatePart(date.getDate())].join('-')} ${time}`;
};

export const getLogLevel = (log: LogEntry): ErrorLevel => {
  if (log.error?.level) {
    return log.error.level;
  }

  if (log.level) {
    return log.level;
  }

  switch (log.class?.toLowerCase()) {
    case 'error':
    case 'parser-error':
      return ErrorLevel.ERROR;
    case 'critical':
      return ErrorLevel.CRITICAL;
    case 'warning':
      return ErrorLevel.WARNING;
    default:
      return ErrorLevel.INFO;
  }
};

export const hasErrorDetails = (log: LogEntry) =>
  !!(log.error?.code || log.error?.hint || log.error?.loc || log.error?.frame || log.error?.timestamp);
