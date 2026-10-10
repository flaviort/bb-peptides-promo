export function createProgress(weights: Record<string, number>, onChange: (value: number) => void) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const parts: Record<string, number> = {};
  const value = () =>
    Object.entries(weights).reduce((acc, [k, w]) => acc + w * (parts[k] ?? 0), 0) / total;
  return {
    update(key: string, fraction: number) {
      if (!(key in weights)) throw new Error(`Unknown progress key: ${key}`);
      const f = Math.min(1, Math.max(0, fraction));
      if (f <= (parts[key] ?? 0)) return;
      parts[key] = f;
      onChange(value());
    },
    value,
  };
}
