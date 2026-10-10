'use client';

import { PRODUCTS, pad2 } from '@/lib/products';
import { sectionForProduct } from '@/lib/scroll/sections';
import { goToSection } from '@/lib/scroll/instance';

export function ProductRail({ current }: { current: number }) {
  return (
    <nav aria-label="All products" className="product-rail">
      <ol>
        {PRODUCTS.map((p, i) => (
          <li key={p.id}>
            <button type="button" aria-current={i === current ? 'true' : undefined} onClick={() => goToSection(sectionForProduct(i))}>
              <span className="rail-num">{pad2(i + 1)}</span>
              {p.name}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
