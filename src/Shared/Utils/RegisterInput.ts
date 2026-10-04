import type { NumberFormat } from '@/Shared/Types/Numbers';

const SEPARATOR_PATTERN = /_/g;
const HEX_PREFIX_PATTERN = /^0x/i;
const BINARY_PREFIX_PATTERN = /^0b/i;
const INVALID_BINARY_DIGIT_PATTERN = /[^01]/;
const INVALID_HEX_DIGIT_PATTERN = /[^0-9a-f]/i;
const INVALID_DECIMAL_DIGIT_PATTERN = /[^0-9]/;

export const parseRegisterInput = (raw: unknown, numberFormat: NumberFormat = 'dec'): bigint | null => {
  const text = String(raw ?? '').trim();
  if (text === '' || text === '-') {
    return null;
  }

  const isNegative = text.startsWith('-');
  const sign = isNegative ? -1n : 1n;
  const unsignedText = isNegative ? text.slice(1) : text;
  let digits = unsignedText.replace(SEPARATOR_PATTERN, '');
  let radix = 10;

  if (numberFormat === 'hex') {
    radix = 16;
  } else if (numberFormat === 'bin') {
    radix = 2;
  }

  // An explicit prefix takes precedence over the selected display format.
  if (HEX_PREFIX_PATTERN.test(digits)) {
    radix = 16;
    digits = digits.slice(2);
  } else if (BINARY_PREFIX_PATTERN.test(digits)) {
    radix = 2;
    digits = digits.slice(2);
  }

  if (!digits) {
    return null;
  }

  const invalidDigitPattern =
    radix === 16 ? INVALID_HEX_DIGIT_PATTERN : radix === 2 ? INVALID_BINARY_DIGIT_PATTERN : INVALID_DECIMAL_DIGIT_PATTERN;
  if (invalidDigitPattern.test(digits)) {
    return null;
  }

  const prefix = radix === 16 ? '0x' : radix === 2 ? '0b' : '';
  const integerLiteral = `${prefix}${digits}`;

  try {
    return sign * BigInt(integerLiteral);
  } catch {
    return null;
  }
};
