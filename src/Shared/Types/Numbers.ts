export type NumberFormat = 'dec' | 'hex' | 'bin';

export type RadixFormat = Exclude<NumberFormat, 'dec'>;

export type FormatNumber = (value: number) => string | number;
