export const KEYS = { age: 'hiatus:age-ok' } as const;

export function readFlag(key: string): boolean | null {
  try {
    const v = localStorage.getItem(key);
    return v === null ? null : v === '1';
  } catch {
    return null;
  }
}

export function writeFlag(key: string, value: boolean): void {
  try {
    localStorage.setItem(key, value ? '1' : '0');
  } catch {
    // Private mode or blocked storage: the site works without persistence.
  }
}
