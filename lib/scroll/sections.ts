export const SECTIONS = [
  'hero', 'profile', 'benefit-1', 'benefit-2', 'benefit-3', 'benefit-4',
  'statement', 'range', 'faq',
] as const;

export type SectionId = (typeof SECTIONS)[number];

export const LAST = SECTIONS.length - 1;
export const RANGE = SECTIONS.indexOf('range');
export const FAQ = SECTIONS.indexOf('faq');

const SLOW = new Set([0, 1, 5, 6]);
export const pageDuration = (to: number): number => (SLOW.has(to) ? 1.5 : 1);
export const sectionIndex = (id: SectionId): number => SECTIONS.indexOf(id);
