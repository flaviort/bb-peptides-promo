import { describe, expect, it } from 'vitest';
import { nearestSection, planPage, resnap, scrollToTime, sectionAt, zoneFor } from '@/lib/scroll/math';

const VH = 800;
// hero and p01 to p12 every 1000, range at 13000, closing (the last section) at 13720.
const TOPS = [...Array.from({ length: 14 }, (_, i) => i * 1000), 13720];

describe('scrollToTime', () => {
  it('maps tops to integer times and interpolates between', () => {
    expect(scrollToTime(0, TOPS)).toBe(0);
    expect(scrollToTime(500, TOPS)).toBeCloseTo(0.5);
    expect(scrollToTime(13360, TOPS)).toBeCloseTo(13.5);
    expect(scrollToTime(13720, TOPS)).toBe(14);
    expect(scrollToTime(99999, TOPS)).toBe(14);
  });
});

describe('section lookup', () => {
  it('finds the nearest top and the section under mid-viewport', () => {
    expect(nearestSection(1400, TOPS)).toBe(1);
    expect(nearestSection(1600, TOPS)).toBe(2);
    expect(sectionAt(700, TOPS, VH)).toBe(1);
    expect(sectionAt(500, TOPS, VH)).toBe(0);
  });
});

describe('zoneFor', () => {
  it('pages everywhere above the range row', () => {
    expect(zoneFor(0, VH, TOPS, 1)).toBe('paged');
    expect(zoneFor(12000, VH, TOPS, 1)).toBe('paged');
  });
  it('scrolls freely from the range row to the end of the page', () => {
    expect(zoneFor(13000, VH, TOPS, 1)).toBe('free');
    expect(zoneFor(13500, VH, TOPS, -1)).toBe('free');
    expect(zoneFor(20000, VH, TOPS, -1)).toBe('free');
  });
  it('pages back up from the top of the range row', () => {
    expect(zoneFor(13000, VH, TOPS, -1)).toBe('paged');
  });
});

describe('planPage', () => {
  it('steps forward and back', () => {
    expect(planPage(0, VH, TOPS, 1)).toEqual({ to: 1, scroll: 1000 });
    expect(planPage(12000, VH, TOPS, 1)).toEqual({ to: 13, scroll: 13000 });
    expect(planPage(13000, VH, TOPS, -1)).toEqual({ to: 12, scroll: 12000 });
  });
  it('stays on the hero when scrolling up from it', () => {
    expect(planPage(0, VH, TOPS, -1)).toBeNull();
  });
  it('never pages past the range row: the page just ends', () => {
    expect(planPage(13000, VH, TOPS, 1)).toBeNull();
  });
});

describe('resnap', () => {
  // The same page after the viewport got shorter: every section top moved.
  const NEW = TOPS.map((t) => t * 0.75);
  it('lands on the same section top in the paged zone', () => {
    expect(resnap(5000, TOPS, NEW)).toBe(3750);
    expect(resnap(5400, TOPS, NEW)).toBe(3750); // nearest page, not a point between products
    expect(resnap(5600, TOPS, NEW)).toBe(4500);
  });
  it('keeps the same relative spot in the free-scrolling zone', () => {
    expect(resnap(13360, TOPS, NEW)).toBeCloseTo(NEW[13] + 0.5 * (NEW[14] - NEW[13]));
    expect(resnap(20000, TOPS, NEW)).toBeCloseTo(20000 - TOPS[14] + NEW[14]);
  });
});
