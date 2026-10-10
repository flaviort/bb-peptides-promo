import { describe, expect, it } from 'vitest';
import {
  ROW_GAP, blendPose, carouselPose, focusPose, nearestSlotForProduct, productAtPos, rowPose, wrapOffset,
} from '@/lib/stage/layout';
import { DEFAULT_VALUES } from '@/lib/stage/values';

describe('wrapOffset', () => {
  it('wraps into [-n/2, n/2)', () => {
    expect(wrapOffset(0, 0, 12)).toBe(0);
    expect(wrapOffset(11, 0, 12)).toBe(-1);
    expect(wrapOffset(1, 11.5, 12)).toBeCloseTo(1.5);
    expect(wrapOffset(6, 0, 12)).toBe(-6);
  });
});

describe('product slots', () => {
  it('picks the nearest slot that shows a product', () => {
    expect(nearestSlotForProduct(0, 11, 12)).toBe(-1);
    expect(nearestSlotForProduct(13, 0, 12)).toBe(12);
    expect(nearestSlotForProduct(1.6, 2, 12)).toBe(2);
  });
  it('reads the product at a carousel position', () => {
    expect(productAtPos(0, 12)).toBe(0);
    expect(productAtPos(-1, 12)).toBe(11);
    expect(productAtPos(13.4, 12)).toBe(1);
  });
});

describe('poses', () => {
  it('centers the middle vial and mirrors the sides in x', () => {
    const c = carouselPose(0, DEFAULT_VALUES);
    expect([c.x, c.z]).toEqual([0, 0]);
    expect(carouselPose(2, DEFAULT_VALUES).x).toBeCloseTo(-carouselPose(-2, DEFAULT_VALUES).x);
  });
  it('blends linearly', () => {
    const a = carouselPose(1, DEFAULT_VALUES);
    const b = rowPose(1);
    expect(blendPose(a, b, 0.5).x).toBeCloseTo((a.x + b.x) / 2);
    expect(blendPose(a, b, 0)).toEqual(a);
  });
  it('reads the focus pose from values', () => {
    expect(focusPose({ ...DEFAULT_VALUES, focusY: 0.5, focusRotY: 2 })).toMatchObject({ y: 0.5, ry: 2 });
  });
  it('packs the range row shoulder to shoulder', () => {
    expect(rowPose(1).x - rowPose(0).x).toBeCloseTo(ROW_GAP);
    expect(ROW_GAP).toBeGreaterThan(1.3); // a vial is 1.3 units wide
    expect(rowPose(1).y).toBeGreaterThan(rowPose(0).y);
  });
});
