import { expect, it, vi } from 'vitest';
import { createProgress } from '@/lib/progress';

it('weights parts and never goes backwards', () => {
  const fn = vi.fn();
  const p = createProgress({ a: 3, b: 1 }, fn);
  p.update('a', 0.5);
  expect(p.value()).toBeCloseTo(0.375);
  p.update('a', 0.2);
  expect(p.value()).toBeCloseTo(0.375);
  p.update('b', 2);
  expect(p.value()).toBeCloseTo(0.625);
  expect(fn).toHaveBeenLastCalledWith(0.625);
});

it('rejects unknown keys', () => {
  const p = createProgress({ a: 1 }, () => {});
  expect(() => p.update('nope', 1)).toThrow(/Unknown progress key/);
});
