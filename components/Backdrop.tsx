'use client';

import { CATEGORIES, PRODUCTS } from '@/lib/products';
import { RANGE, productForSection } from '@/lib/scroll/sections';
import { useApp } from '@/lib/store';

// The Ink room. Which floor pool is lit follows the category on screen (spec 4.5).
export function Backdrop() {
  const section = useApp((s) => s.section);
  const product = useApp((s) => s.product);
  const inWalk = productForSection(section) !== null;
  const light = inWalk ? CATEGORIES[PRODUCTS[product].category].light : section === RANGE ? 'range' : 'electric';
  return (
    <div className="backdrop" data-light={light} aria-hidden="true">
      <div className="pool pool--electric" />
      <div className="pool pool--light" />
      <div className="pool pool--beam" />
      <div className="pool pool--range" />
      <div className="backdrop-grid" />
    </div>
  );
}
