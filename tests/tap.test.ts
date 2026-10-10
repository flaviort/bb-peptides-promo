import { expect, it } from 'vitest';
import { isTap } from '@/lib/tap';

it('counts a press and release in place as a tap, and a swipe as a scroll', () => {
  expect(isTap({ x: 100, y: 200 }, { x: 103, y: 204 })).toBe(true);
  expect(isTap({ x: 100, y: 200 }, { x: 100, y: 240 })).toBe(false);
  expect(isTap(null, { x: 100, y: 200 })).toBe(false);
});
