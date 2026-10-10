import { describe, expect, it } from 'vitest';
import { PRODUCTS } from '@/lib/products';
import { dipScale, facesAway, labelTarget, lightMix, spinAngle, spinPhase } from '@/lib/stage/walk';

const CATS = PRODUCTS.map((p) => p.category);

describe('spin', () => {
  it('turns once per product and is half a turn at every swap point', () => {
    expect(spinAngle(0)).toBe(0);
    expect(spinAngle(3.25)).toBeCloseTo(Math.PI / 2);
    for (let k = -1; k < 12; k++) expect(spinAngle(k + 0.5)).toBeCloseTo(Math.PI);
  });
  it('phases from 0 at a product to 1 mid-spin', () => {
    expect(spinPhase(4)).toBeCloseTo(0);
    expect(spinPhase(4.5)).toBeCloseTo(1);
    expect(spinPhase(-0.5)).toBeCloseTo(1);
  });
});

describe('labelTarget', () => {
  it('shows the vial’s own product outside the walk', () => {
    expect(labelTarget(-1, 7, 12)).toBe(7);
    expect(labelTarget(-0.6, 7, 12)).toBe(7);
    expect(labelTarget(11.6, 7, 12)).toBe(7);
    expect(labelTarget(12, 7, 12)).toBe(7);
  });
  it('shows the walk product inside it, changing exactly at the half turns', () => {
    expect(labelTarget(-0.4, 7, 12)).toBe(0);
    expect(labelTarget(4.49, 7, 12)).toBe(4);
    expect(labelTarget(4.51, 7, 12)).toBe(5);
    expect(labelTarget(11.4, 7, 12)).toBe(11);
  });
});

describe('reduced-motion dip', () => {
  it('is full size at a product and smallest at a swap', () => {
    expect(dipScale(3)).toBeCloseTo(1);
    expect(dipScale(3.5)).toBeCloseTo(0.15);
    expect(dipScale(-0.5)).toBeCloseTo(0.15);
  });
});

describe('facesAway', () => {
  it('is true only when the label points away from the camera', () => {
    expect(facesAway(Math.PI)).toBe(true);
    expect(facesAway(3 * Math.PI)).toBe(true);
    expect(facesAway(0)).toBe(false);
    expect(facesAway(Math.PI / 2)).toBe(false);
  });
});

describe('lightMix', () => {
  const sum = (m: Record<string, number>) => Object.values(m).reduce((a, b) => a + b, 0);
  it('is pure on a product and blends only across a category boundary', () => {
    expect(lightMix(0, CATS)).toEqual({ electric: 1, light: 0, beam: 0 });
    expect(lightMix(2.5, CATS)).toEqual({ electric: 1, light: 0, beam: 0 });
    const m = lightMix(3.5, CATS); // MOTS-C to BPC-157
    expect(m.electric).toBeCloseTo(0.5);
    expect(m.light).toBeCloseTo(0.5);
    expect(lightMix(11, CATS).beam).toBe(1);
  });
  it('clamps outside the walk and always sums to 1', () => {
    expect(lightMix(-1, CATS).electric).toBe(1);
    expect(lightMix(12, CATS).beam).toBe(1);
    for (let w = -1; w <= 12; w += 0.13) expect(sum(lightMix(w, CATS))).toBeCloseTo(1);
  });
});
