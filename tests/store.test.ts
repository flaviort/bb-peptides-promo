import { expect, it, vi } from 'vitest';
import { createStore } from '@/lib/store';

it('notifies only on real changes', () => {
  const s = createStore({ a: 1, b: 2 });
  const fn = vi.fn();
  s.subscribe(fn);
  s.set({ a: 1 });
  expect(fn).not.toHaveBeenCalled();
  s.set({ a: 2 });
  expect(fn).toHaveBeenCalledTimes(1);
  expect(s.get()).toEqual({ a: 2, b: 2 });
});

it('unsubscribes', () => {
  const s = createStore({ a: 1 });
  const fn = vi.fn();
  const off = s.subscribe(fn);
  off();
  s.set({ a: 3 });
  expect(fn).not.toHaveBeenCalled();
});
