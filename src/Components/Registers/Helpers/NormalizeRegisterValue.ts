import { positiveModulo } from '@/Shared/Utils/Numbers';

/** Wraps integers to the register range; an unavailable bound leaves the value unchanged. */
export const normalizeRegisterValue = (value: bigint, maximum: number): bigint => {
  if (!Number.isFinite(maximum) || maximum < 0) {
    return value;
  }

  const upperBound = BigInt(maximum);
  if (value >= 0n && value <= upperBound) {
    return value;
  }

  return positiveModulo(value, upperBound + 1n);
};
