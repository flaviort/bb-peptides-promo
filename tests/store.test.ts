import { expect, it, vi } from 'vitest';
import { createStore, selectProduct, store } from '@/lib/store';

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

it('wraps product selection and marks it as a UI choice', () => {
  selectProduct(-1);
  expect(store.get()).toMatchObject({ product: 11, productSource: 'ui' });
  selectProduct(12);
  expect(store.get().product).toBe(0);
});
