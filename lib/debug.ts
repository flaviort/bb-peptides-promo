import { FLAVORS } from './flavors';
import { SECTIONS, type SectionId } from './scroll/sections';

export interface Debug {
  skipGate: boolean;
  section: number | null;
  flavor: number | null;
}

const OFF: Debug = { skipGate: false, section: null, flavor: null };

export function readDebug(search: string = typeof location === 'undefined' ? '' : location.search): Debug {
  if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_DEBUG) return OFF;
  const q = new URLSearchParams(search);
  const rawSection = q.get('section');
  let section: number | null = null;
  if (rawSection !== null) {
    const byId = SECTIONS.indexOf(rawSection as SectionId);
    const byIndex = Number(rawSection);
    if (byId >= 0) section = byId;
    else if (Number.isInteger(byIndex) && byIndex >= 0 && byIndex < SECTIONS.length) section = byIndex;
  }
  const f = FLAVORS.findIndex((x) => x.id === q.get('flavor'));
  return { skipGate: q.get('gate') === 'skip', section, flavor: f >= 0 ? f : null };
}
