import { afterEach, expect, it, vi } from 'vitest';
import { withTimeout } from '@/lib/timeout';

afterEach(() => vi.useRealTimers());

it('resolves when the promise wins', async () => {
  await expect(withTimeout(Promise.resolve(3), 100)).resolves.toBe(3);
});

it('rejects a stalled promise after the timeout', async () => {
  vi.useFakeTimers();
  const p = withTimeout(new Promise(() => {}), 8000);
  vi.advanceTimersByTime(8000);
  await expect(p).rejects.toThrow('timeout');
});
