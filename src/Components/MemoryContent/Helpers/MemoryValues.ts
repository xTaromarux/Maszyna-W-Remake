const DECIMAL_INTEGER_PATTERN = /^[+-]?\d+$/;

/** Accept complete decimal integers, never truncated fractions or scientific notation. */
export const parseMemoryInput = (raw: string): number | null => {
  const text = raw.trim();
  if (!DECIMAL_INTEGER_PATTERN.test(text)) {
    return null;
  }

  const value = Number(text);
  return Number.isSafeInteger(value) ? value : null;
};

export const getMemoryBounds = (wordBits: number, signed: boolean) => {
  const modulus = 2 ** wordBits;
  return {
    min: signed ? -modulus / 2 : 0,
    max: signed ? modulus / 2 - 1 : modulus - 1,
  };
};
