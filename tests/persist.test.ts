// @vitest-environment jsdom
import { beforeEach, expect, it, vi } from 'vitest';
import { readFlag, writeFlag } from '@/lib/persist';

beforeEach(() => localStorage.clear());

it('round-trips booleans', () => {
  expect(readFlag('k')).toBeNull();
  writeFlag('k', true);
  expect(readFlag('k')).toBe(true);
  writeFlag('k', false);
  expect(readFlag('k')).toBe(false);
});

it('survives blocked storage', () => {
  const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
  const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
  expect(readFlag('k')).toBeNull();
  expect(() => writeFlag('k', true)).not.toThrow();
  get.mockRestore();
  set.mockRestore();
});
