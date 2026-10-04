/** Reads optional fields from untrusted JSON without assuming a response shape. */
export const readResponseField = (value: unknown, ...keys: (string | number)[]): unknown => {
  let current = value;

  for (const key of keys) {
    if (!current || typeof current !== 'object') {
      return undefined;
    }

    current = (current as Record<string | number, unknown>)[key];
  }

  return current;
};

export const parseResponseData = (text: string, fallback: unknown = text): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
};

/** Normalizes the response formats supported by the chat proxy. */
export const extractResponseText = (data: unknown): string => {
  const candidates = [
    data,
    readResponseField(data, 'response'),
    readResponseField(data, 'text'),
    readResponseField(data, 'data', 'text'),
    readResponseField(data, 'choices', 0, 'message', 'content'),
    Array.isArray(data) ? data[0] : undefined,
  ];

  return candidates.find((value): value is string => typeof value === 'string') ?? '';
};

export const requireResponseText = (text: string): string => {
  if (!text) {
    throw new Error('AI did not return a response');
  }

  return text;
};
