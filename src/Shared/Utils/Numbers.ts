import type { NumberFormat, RadixFormat } from '@/Types/Common';
/** Clamp a number without coercion or changing NaN handling. */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function clamp01(value: number): number {
  return clamp(Number.isFinite(value) ? value : 0, 0, 1);
}

/** Nonnegative remainder for a positive modulus; both arguments may be bigint. */
export function positiveModulo(value: number, modulus: number): number;
export function positiveModulo(value: bigint, modulus: bigint): bigint;
export function positiveModulo(value: number | bigint, modulus: number | bigint): number | bigint {
  if (typeof value === 'bigint' && typeof modulus === 'bigint') return ((value % modulus) + modulus) % modulus;
  if (typeof value === 'number' && typeof modulus === 'number') return ((value % modulus) + modulus) % modulus;
  throw new TypeError('Value and modulus must use the same numeric type');
}

export function toUnsigned(value: number, bits: number): number {
  return positiveModulo(value, 2 ** bits);
}

export function toSigned(value: number, bits: number): number {
  const modulus = 2 ** bits;
  const unsigned = positiveModulo(value, modulus);
  return unsigned >= modulus / 2 ? unsigned - modulus : unsigned;
}

/** Format a binary or hexadecimal value. Callers choose whether to round first. */
export function formatRadix(value: number, format: RadixFormat, prefix = true): string {
  const hex = format === 'hex';
  const digits = value.toString(hex ? 16 : 2);
  return `${prefix ? (hex ? '0x' : '0b') : ''}${hex ? digits.toUpperCase() : digits}`;
}

export function formatNumberInput(value: unknown, format: NumberFormat): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '';
  return format === 'hex' || format === 'bin' ? formatRadix(Math.floor(value), format, false) : String(value);
}
