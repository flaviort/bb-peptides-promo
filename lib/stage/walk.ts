import { CATEGORIES, type CategorySlug, type LightKind } from '@/lib/products';

// The walk is one continuous timeline value: -1 on the hero, 0 to 11 across the product sections,
// 12 on the range row. The focus vial turns once per unit, so every half unit, where round(walk)
// changes product, is the moment its label faces straight away from the camera.

export const TAU = Math.PI * 2;

const frac = (x: number) => x - Math.floor(x);

export function spinAngle(walk: number): number {
  return TAU * frac(walk);
}

export function spinPhase(walk: number): number {
  return Math.sin(Math.PI * frac(walk));
}

export function labelTarget(walk: number, own: number, count: number): number {
  // + 0 turns Math.round(-0.4) = -0 into 0.
  const i = Math.round(walk) + 0;
  return i >= 0 && i < count ? i : own;
}

export function dipScale(walk: number): number {
  return 0.15 + 0.85 * Math.abs(Math.cos(Math.PI * walk));
}

// Takes the z of the label's world direction (1 faces the camera, -1 faces straight away).
export function facesAway(towardCamera: number): boolean {
  return towardCamera < -0.2;
}

export type LightMix = Record<LightKind, number>;

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Category lighting: pure on each product, blended over the middle half of a step that crosses categories.
export function lightMix(walk: number, categories: readonly CategorySlug[]): LightMix {
  const last = categories.length - 1;
  const w = Math.min(last, Math.max(0, walk));
  const i0 = Math.floor(w);
  const i1 = Math.min(last, i0 + 1);
  const s = smoothstep(0.25, 0.75, w - i0);
  const mix: LightMix = { electric: 0, light: 0, beam: 0 };
  mix[CATEGORIES[categories[i0]].light] += 1 - s;
  mix[CATEGORIES[categories[i1]].light] += s;
  return mix;
}
