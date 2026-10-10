import { describe, expect, it } from 'vitest';
import { nearestSection, planPage, scrollToTime, sectionAt, zoneFor } from '@/lib/scroll/math';

const VH = 800;
// hero ... statement every 1000, range at 7000, faq (the last section) at 7720.
const TOPS = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 7720];

describe('scrollToTime', () => {
  it('maps tops to integer times and interpolates between', () => {
    expect(scrollToTime(0, TOPS)).toBe(0);
    expect(scrollToTime(500, TOPS)).toBeCloseTo(0.5);
    expect(scrollToTime(7360, TOPS)).toBeCloseTo(7.5);
    expect(scrollToTime(7720, TOPS)).toBe(8);
    expect(scrollToTime(99999, TOPS)).toBe(8);
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
    expect(zoneFor(6000, VH, TOPS, 1)).toBe('paged');
  });
  it('scrolls freely from the range row to the end of the page', () => {
    expect(zoneFor(7000, VH, TOPS, 1)).toBe('free');
    expect(zoneFor(7500, VH, TOPS, -1)).toBe('free');
    expect(zoneFor(9000, VH, TOPS, 1)).toBe('free');
    expect(zoneFor(9000, VH, TOPS, -1)).toBe('free');
  });
  it('pages back up from the top of the range row', () => {
    expect(zoneFor(7000, VH, TOPS, -1)).toBe('paged');
  });
});

describe('planPage', () => {
  it('steps forward and back', () => {
    expect(planPage(0, VH, TOPS, 1)).toEqual({ to: 1, scroll: 1000 });
    expect(planPage(6000, VH, TOPS, 1)).toEqual({ to: 7, scroll: 7000 });
    expect(planPage(7000, VH, TOPS, -1)).toEqual({ to: 6, scroll: 6000 });
  });
  it('stays on the hero when scrolling up from it', () => {
    expect(planPage(0, VH, TOPS, -1)).toBeNull();
  });
  it('never pages past the range row: the page just ends', () => {
    expect(planPage(7000, VH, TOPS, 1)).toBeNull();
    expect(planPage(9000, VH, TOPS, 1)).toBeNull();
  });
});
