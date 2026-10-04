export function generateId(prefix = 'msg'): string {
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Math.random().toString(36).slice(2)}${Date.now()}`;
  return `${prefix}-${id}`;
}
