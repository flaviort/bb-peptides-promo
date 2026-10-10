import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { Carousel } from '@/lib/stage/Carousel';
import type { ProductModel } from '@/lib/stage/ProductModel';
import { DEFAULT_VALUES, type SceneValues } from '@/lib/stage/values';

class FakeModel implements ProductModel {
  readonly group = new THREE.Group();
  swaps: { to: number; ry: number; scale: number }[] = [];
  constructor(private index: number) {}
  get labelIndex() { return this.index; }
  setLabel(i: number) {
    this.swaps.push({ to: i, ry: this.group.rotation.y, scale: this.group.scale.x });
    this.index = i;
  }
  dispose() {}
}

const N = 12;
const setup = (reduced: boolean, centerOn = 5) => {
  const models = Array.from({ length: N }, (_, i) => new FakeModel(i));
  const c = new Carousel(models, { reduced });
  c.target = c.pos = centerOn;
  return { c, models, center: models[centerOn] };
};

// The timeline drives focus 0 to 1 over hero to p01 (walk -1 to 0) and 1 to 0 over p12 to range (walk 11 to 12).
const valuesAt = (walk: number): SceneValues => {
  const focus = walk < 0 ? walk + 1 : walk > 11 ? 12 - walk : 1;
  return { ...DEFAULT_VALUES, walk, focus, sideFade: focus, focusRotY: -0.14 };
};

const run = (c: Carousel, from: number, to: number, step: number) => {
  const dir = Math.sign(to - from);
  for (let w = from; dir * (to - w) > 1e-9; w += dir * step) c.update(1 / 60, valuesAt(w), { mx: 0, my: 0 });
  c.update(1 / 60, valuesAt(to), { mx: 0, my: 0 });
};

describe('label swaps during the walk', () => {
  it('only swaps while the label faces away, and lands on each product', () => {
    const { c, center } = setup(false);
    run(c, -1, 11, 0.02);
    expect(center.labelIndex).toBe(11);
    expect(center.swaps.map((s) => s.to)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    for (const s of center.swaps) expect(Math.cos(s.ry)).toBeLessThan(-0.2);
  });

  it('turns back into its own product leaving for the range row', () => {
    const { c, center } = setup(false);
    run(c, -1, 12, 0.02);
    expect(center.labelIndex).toBe(5);
    expect(Math.cos(center.swaps[center.swaps.length - 1].ry)).toBeLessThan(-0.2);
  });

  it('walks backwards to the hero just as cleanly', () => {
    const { c, center } = setup(false);
    run(c, -1, 6, 0.02);
    run(c, 6, -1, 0.02);
    expect(center.labelIndex).toBe(5);
    for (const s of center.swaps) expect(Math.cos(s.ry)).toBeLessThan(-0.2);
  });

  it('still lands on the right product when frames are coarse (a fast jump)', () => {
    const { c, center } = setup(false);
    run(c, -1, 10, 0.37);
    expect(center.labelIndex).toBe(10);
  });

  it('shows the right product when the very first frame is already deep in the walk (a deep link)', () => {
    const { c, center } = setup(false);
    c.update(1 / 60, valuesAt(4), { mx: 0, my: 0 });
    expect(center.labelIndex).toBe(4);
  });

  it('leaves vials that are not in focus on their own label', () => {
    const { c, models } = setup(false);
    run(c, -1, 7, 0.05);
    models.forEach((m, i) => { if (i !== 5) expect(m.labelIndex).toBe(i); });
  });
});

describe('reduced motion', () => {
  it('never spins and swaps at the bottom of the dip', () => {
    const { c, center } = setup(true);
    run(c, -1, 4, 0.02);
    expect(center.labelIndex).toBe(4);
    for (const s of center.swaps) expect(s.scale).toBeLessThan(0.75);
    c.update(1 / 60, valuesAt(4), { mx: 0, my: 0 });
    expect(Math.abs(center.group.rotation.y + 0.14)).toBeLessThan(0.01);
  });
});

describe('range row', () => {
  it('lines the vials up in walk order, centered, whatever the hero showed', () => {
    const { c, models } = setup(false, 7);
    for (let k = 0; k < 120; k++) c.update(1 / 60, { ...DEFAULT_VALUES, row: 1, walk: 12 }, { mx: 0, my: 0 });
    const xs = models.map((m) => m.group.position.x);
    for (let i = 1; i < N; i++) expect(xs[i]).toBeGreaterThan(xs[i - 1]);
    expect(xs[0] + xs[N - 1]).toBeCloseTo(0, 5);
  });
});

describe('hero ring', () => {
  it('shrinks vials with distance from the center so the lit vial leads', () => {
    const { c, models } = setup(false, 0);
    c.update(1 / 60, { ...DEFAULT_VALUES }, { mx: 0, my: 0 });
    const scale = (i: number) => models[i].group.scale.x;
    expect(scale(0)).toBe(1);
    expect(scale(1)).toBeLessThan(1);
    expect(scale(2)).toBeLessThan(scale(1));
    expect(scale(11)).toBeCloseTo(scale(1));
  });
});
