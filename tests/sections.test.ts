import { expect, it } from 'vitest';
import {
  CLOSING, FIRST_PRODUCT, LAST, LAST_PRODUCT, RANGE, SECTIONS, WALK_SECTIONS, pageDuration, productForSection, sectionForProduct,
} from '@/lib/scroll/sections';

it('lays out hero, 12 products, range and closing', () => {
  expect(SECTIONS).toHaveLength(15);
  expect(SECTIONS[0]).toBe('hero');
  expect(SECTIONS[FIRST_PRODUCT]).toBe('p01');
  expect(SECTIONS[LAST_PRODUCT]).toBe('p12');
  expect(RANGE).toBe(13);
  expect(CLOSING).toBe(14);
  expect(LAST).toBe(14);
  expect(WALK_SECTIONS).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
});

it('maps products to sections and back', () => {
  expect(sectionForProduct(0)).toBe(1);
  expect(sectionForProduct(11)).toBe(12);
  expect(productForSection(1)).toBe(0);
  expect(productForSection(12)).toBe(11);
  expect(productForSection(0)).toBeNull();
  expect(productForSection(RANGE)).toBeNull();
});

it('pages slowly into and out of the walk, quickly between products, longer for jumps', () => {
  expect(pageDuration(0, 1)).toBe(1.4);
  expect(pageDuration(1, 0)).toBe(1.4);
  expect(pageDuration(12, 13)).toBe(1.4);
  expect(pageDuration(2, 3)).toBe(0.9);
  // Jumps get at least 0.28s per product so the spins stay readable.
  expect(pageDuration(2, 9)).toBeCloseTo(1.96);
  expect(pageDuration(0, 12)).toBeCloseTo(3.36);
});
