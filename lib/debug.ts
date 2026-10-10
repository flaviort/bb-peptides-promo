import { PRODUCTS } from './products';
import { SECTIONS, type SectionId } from './scroll/sections';

export interface Debug {
  skipIntro: boolean;
  section: number | null;
  product: number | null;
}

const OFF: Debug = { skipIntro: false, section: null, product: null };

// Dev only (or a build with NEXT_PUBLIC_DEBUG=1): /?intro=skip&section=<id|index>&product=<id>
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
  const p = PRODUCTS.findIndex((x) => x.id === q.get('product'));
  return { skipIntro: q.get('intro') === 'skip', section, product: p >= 0 ? p : null };
}
