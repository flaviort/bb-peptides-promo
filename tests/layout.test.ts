import { describe, expect, it } from 'vitest';
import {
  blendPose, carouselPose, flavorAtPos, focusPose, nearestSlotForFlavor, rowPose, wrapOffset,
} from '@/lib/stage/layout';
import { DEFAULT_VALUES } from '@/lib/stage/values';

describe('wrapOffset', () => {
  it('wraps into [-n/2, n/2)', () => {
    expect(wrapOffset(0, 0, 16)).toBe(0);
    expect(wrapOffset(15, 0, 16)).toBe(-1);
    expect(wrapOffset(1, 15.5, 16)).toBeCloseTo(1.5);
    expect(wrapOffset(8, 0, 16)).toBe(-8);
    expect(wrapOffset(3, -20, 16)).toBe(7);
  });
});

describe('flavor slots', () => {
  it('picks the nearest slot that shows a flavor', () => {
    expect(nearestSlotForFlavor(0, 3, 4)).toBe(-1);
    expect(nearestSlotForFlavor(5, 0, 4)).toBe(4);
    expect(nearestSlotForFlavor(1.6, 2, 4)).toBe(2);
  });
  it('reads the flavor at a carousel position', () => {
    expect(flavorAtPos(0, 4)).toBe(0);
    expect(flavorAtPos(-1, 4)).toBe(3);
    expect(flavorAtPos(5.4, 4)).toBe(1);
  });
});

describe('poses', () => {
  it('centers the middle can and mirrors the sides in x', () => {
    const c = carouselPose(0, DEFAULT_VALUES);
    expect([c.x, c.z]).toEqual([0, 0]);
    expect(carouselPose(2, DEFAULT_VALUES).x).toBeCloseTo(-carouselPose(-2, DEFAULT_VALUES).x);
    expect(carouselPose(2, DEFAULT_VALUES).z).toBeLessThan(0);
  });
  it('blends linearly', () => {
    const a = carouselPose(1, DEFAULT_VALUES);
    const b = rowPose(1);
    const m = blendPose(a, b, 0.5);
    expect(m.x).toBeCloseTo((a.x + b.x) / 2);
    expect(blendPose(a, b, 0)).toEqual(a);
  });
  it('reads the focus pose from values', () => {
    expect(focusPose({ ...DEFAULT_VALUES, focusY: 0.5, focusRotY: 2 })).toMatchObject({ y: 0.5, ry: 2 });
  });
  it('packs the range row shoulder to shoulder, rising and receding to the right', () => {
    const a = rowPose(0);
    const b = rowPose(1);
    expect(b.x - a.x).toBeGreaterThan(1); // a can is 1 unit wide
    expect(b.x - a.x).toBeLessThan(1.3);
    expect(b.y).toBeGreaterThan(a.y);
    expect(b.z).toBeLessThan(a.z);
  });
});
