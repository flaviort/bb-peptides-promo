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

// Into and out of the walk the camera travels, so those pages take longer. Jumps across several
// products add time so each spin stays readable.
export function pageDuration(from: number, to: number): number {
  const lo = Math.min(from, to);
  const hi = Math.max(from, to);
  const base = lo === 0 || hi === RANGE ? 1.4 : 0.9;
  return Math.min(2.4, base + 0.15 * (hi - lo - 1));
}

export const sectionIndex = (id: SectionId): number => SECTIONS.indexOf(id);
