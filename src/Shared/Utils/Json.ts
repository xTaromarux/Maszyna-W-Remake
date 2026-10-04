/** Clone JSON data, including observable proxies that structuredClone cannot copy. */
export function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}
