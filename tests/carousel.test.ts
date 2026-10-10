import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { Carousel, labelToward } from '@/lib/stage/Carousel';
import type { ProductModel } from '@/lib/stage/ProductModel';
import { DEFAULT_VALUES, type SceneValues } from '@/lib/stage/values';
import { isProductJump, pageDuration, pageEase } from '@/lib/scroll/sections';

class FakeModel implements ProductModel {
  readonly group = new THREE.Group();
  swaps: { to: number; toward: number; scale: number }[] = [];
  constructor(private index: number) {}
  get labelIndex() { return this.index; }
  setLabel(i: number) {
    this.swaps.push({ to: i, toward: labelToward(this.group), scale: this.group.scale.x });
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
    for (const s of center.swaps) expect(s.toward).toBeLessThan(-0.2);
  });

  it('turns back into its own product leaving for the range row', () => {
    const { c, center } = setup(false);
    run(c, -1, 12, 0.02);
    expect(center.labelIndex).toBe(5);
    expect(center.swaps[center.swaps.length - 1].toward).toBeLessThan(-0.2);
  });

  it('walks backwards to the hero just as cleanly', () => {
    const { c, center } = setup(false);
    run(c, -1, 6, 0.02);
    run(c, 6, -1, 0.02);
    expect(center.labelIndex).toBe(5);
    for (const s of center.swaps) expect(s.toward).toBeLessThan(-0.2);
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

describe('paged jumps at 30fps (the mobile floor)', () => {
  // Section s sits at walk s - 1: hero -1, p01 0, ..., p12 11, range 12.
  // The pager tells the carousel about a product to product jump, as lib/boot.ts wires it.
  const jump = (c: Carousel, from: number, to: number) => {
    c.jump = isProductJump(from, to) ? { from: from - 1, to: to - 1 } : null;
    const d = pageDuration(from, to);
    const ease = pageEase(from, to);
    const frames = Math.ceil(d * 30);
    for (let k = 0; k <= frames; k++) {
      const s = from + (to - from) * ease(k / frames);
      c.update(1 / 30, valuesAt(s - 1), { mx: 0, my: 0 });
    }
    c.jump = null;
    c.update(1 / 30, valuesAt(to - 1), { mx: 0, my: 0 });
  };
  for (const [from, to] of [[2, 11], [0, 11], [11, 2], [0, 13], [1, 2]]) {
    it(`never swaps a label facing the camera, section ${from} to ${to}`, () => {
      const { c, center } = setup(false);
      c.update(1 / 30, valuesAt(from - 1), { mx: 0, my: 0 });
      center.swaps = [];
      jump(c, from, to);
      for (const s of center.swaps) expect(s.toward).toBeLessThan(-0.2);
      expect(center.labelIndex).toBe(to >= 1 && to <= 12 ? to - 1 : 5);
    });
  }
  for (const [from, to] of [[1, 12], [12, 1], [1, 4], [1, 6], [9, 3]]) {
    it(`swaps the label once, straight to the destination, section ${from} to ${to}`, () => {
      const { c, center } = setup(false);
      c.update(1 / 30, valuesAt(from - 1), { mx: 0, my: 0 });
      center.swaps = [];
      jump(c, from, to);
      expect(center.swaps.map((s) => s.to)).toEqual([to - 1]);
      expect(center.swaps[0].toward).toBeLessThan(-0.2);
    });
  }
});

describe('range row magnifier', () => {
  const rowValues = (): SceneValues => ({ ...DEFAULT_VALUES, walk: 12, focus: 0, row: 1 });

  it('makes the vial under the focus point the biggest, and follows the focus', () => {
    const { c, models } = setup(false);
    // Product 03 sits 3.5 slots left of the row's center.
    const x03 = (2 - (N - 1) / 2) * 1.5;
    c.update(1 / 60, rowValues(), { mx: 0, my: 0, rowFocusX: x03 });
    const scales = models.map((m) => m.group.scale.x);
    expect(scales.indexOf(Math.max(...scales))).toBe(2);
    expect(scales[2]).toBeGreaterThan(scales[0]);

    c.update(1 / 60, rowValues(), { mx: 0, my: 0, rowFocusX: 0 });
    const centered = models.map((m) => m.group.scale.x);
    // Centered between 06 and 07, those two swell together.
    expect(centered[5]).toBeCloseTo(centered[6], 6);
    expect(centered[5]).toBeGreaterThan(centered[2]);
  });

  it('leaves the hero ring alone', () => {
    const { c, models } = setup(false);
    c.update(1 / 60, { ...DEFAULT_VALUES, walk: -1, focus: 0, row: 0 }, { mx: 0, my: 0, rowFocusX: 0 });
    const far = models[11].group.scale.x;
    c.update(1 / 60, { ...DEFAULT_VALUES, walk: -1, focus: 0, row: 0 }, { mx: 0, my: 0, rowFocusX: 9 });
    expect(models[11].group.scale.x).toBe(far);
  });
});
