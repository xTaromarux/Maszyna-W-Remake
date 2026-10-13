/** Access storage only when called, so imports are safe during server rendering. */
export function getStorageItem(key: string, fallback: string | null = null): string | null {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

/** A null value removes the key; an empty string is stored as an empty string. */
export function setStorageItem(key: string, value: string | null): boolean {
  try {
    if (value == null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
    return true;
  } catch {
    // Disabled storage or a full quota must not prevent the application running.
    return false;
  }
}
