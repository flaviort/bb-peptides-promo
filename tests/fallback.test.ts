import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { armBootFallback } from '@/lib/fallback';
import { store } from '@/lib/store';

beforeEach(() => {
  vi.useFakeTimers();
  store.set({ ready: false, webgl: true });
});
afterEach(() => vi.useRealTimers());

it('lets the visitor in on the static path when boot never gets ready', () => {
  armBootFallback(9000);
  vi.advanceTimersByTime(8999);
  expect(store.get().ready).toBe(false);
  vi.advanceTimersByTime(1);
  expect(store.get()).toMatchObject({ ready: true, webgl: false });
});

it('does nothing when boot got ready in time, or was cancelled', () => {
  const cancel = armBootFallback(9000);
  store.set({ ready: true });
  vi.advanceTimersByTime(9000);
  expect(store.get().webgl).toBe(true);
  store.set({ ready: false });
  cancel();
  vi.advanceTimersByTime(9000);
  expect(store.get().ready).toBe(false);
});
