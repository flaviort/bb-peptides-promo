export const SECTIONS = [
  'hero', 'p01', 'p02', 'p03', 'p04', 'p05', 'p06', 'p07', 'p08', 'p09', 'p10', 'p11', 'p12', 'range', 'closing',
] as const;

export type SectionId = (typeof SECTIONS)[number];

export const LAST = SECTIONS.length - 1;
export const RANGE = SECTIONS.indexOf('range');
export const CLOSING = SECTIONS.indexOf('closing');
export const FIRST_PRODUCT = 1;
export const LAST_PRODUCT = 12;
export const WALK_SECTIONS = Array.from({ length: LAST_PRODUCT - FIRST_PRODUCT + 1 }, (_, i) => FIRST_PRODUCT + i);

export const sectionForProduct = (i: number): number => FIRST_PRODUCT + i;

export function productForSection(s: number): number | null {
  return s >= FIRST_PRODUCT && s <= LAST_PRODUCT ? s - FIRST_PRODUCT : null;
}

// Into and out of the walk the camera travels, so those pages take longer. A jump across several
// sections that leaves the walk spins the vial once per product, so it gets at least SPIN_TIME per
// product and an even sine ease: its peak speed stays under about 6 turns a second, slow enough
// that even at 30fps each label swap still lands while the label faces away.
const SPIN_TIME = 0.28;

/** A jump between two products that skips at least one: the vial makes JUMP_TURNS and swaps its label once. */
export function isProductJump(from: number, to: number): boolean {
  return productForSection(from) !== null && productForSection(to) !== null && Math.abs(to - from) > 1;
}

export function pageDuration(from: number, to: number): number {
  const lo = Math.min(from, to);
  const hi = Math.max(from, to);
  const base = lo === 0 || hi === RANGE ? 1.4 : 0.9;
  if (isProductJump(from, to)) return Math.min(1.2, Math.max(base, 0.5 + 0.07 * (hi - lo)));
  return hi - lo > 1 ? Math.max(base, SPIN_TIME * (hi - lo)) : base;
}

export const sectionIndex = (id: SectionId): number => SECTIONS.indexOf(id);

export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

export const easeInOutSine = (t: number): number => (1 - Math.cos(Math.PI * t)) / 2;

export function pageEase(from: number, to: number): (t: number) => number {
  return Math.abs(to - from) > 1 ? easeInOutSine : easeOutCubic;
}
