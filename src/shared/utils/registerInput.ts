import type { NumberFormat } from '@/types/common';
export function parseRegisterInput(raw: unknown, numberFormat: NumberFormat = 'dec'): bigint | null {
  const text = String(raw ?? '').trim();
  if (text === '' || text === '-') return null;
  let body = text;
  let sign = 1n;
  if (body.startsWith('-')) {
    sign = -1n;
    body = body.slice(1);
  }
  body = body.replace(/_/g, '');
  let base = numberFormat === 'hex' ? 16 : numberFormat === 'bin' ? 2 : 10;
  if (/^0x/i.test(body)) {
    base = 16;
    body = body.slice(2);
  } else if (/^0b/i.test(body)) {
    base = 2;
    body = body.slice(2);
  }
  if (!body || (base === 2 && /[^01]/.test(body)) || (base === 16 && /[^0-9a-f]/i.test(body)) || (base === 10 && /[^0-9]/.test(body)))
    return null;
  try {
    return sign * BigInt(base === 16 ? `0x${body}` : base === 2 ? `0b${body}` : body);
  } catch {
    return null;
  }
}
