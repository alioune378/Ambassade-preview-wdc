/**
 * Small wrapper around localStorage. Storage can be blocked (private mode,
 * strict settings), so every access is guarded and the app works without it.
 * Only demonstration data is stored here; never personal data.
 */
const PREFIX = 'dalal-scd:';

export function readStore<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeStore(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage unavailable: keep working in memory */
  }
}
