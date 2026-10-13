export type Locale = 'pl' | 'en';

export type Update<T> = (value: T) => void;

export type Action = () => void;

export type Timer = ReturnType<typeof setTimeout>;

export type Translator = (key: string, params?: Record<string, unknown>) => string;

export type JsonPrimitive = string | number | boolean | null;

export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue | undefined };
