'use client';

import Image from 'next/image';
import { PRODUCTS, productUrl } from '@/lib/products';
import { RANGE } from '@/lib/scroll/sections';
import { useApp } from '@/lib/store';
import { Layer } from '@/components/ui/Layer';
import { Reveal } from '@/components/ui/Reveal';
import { cn } from '@/lib/cn';

// Hovering a vial in the row (lib/boot.ts) lifts it and names it here. The links below are the
// keyboard and touch route to every product page.
export function RangeLayer() {
  const hover = useApp((s) => s.hover);
  const webgl = useApp((s) => s.webgl);
  return (
    <Layer indices={[RANGE]} label="The full lineup">
      {(active) => (
        <>
          <Reveal as="h2" show={active} className="display range-title">The full lineup</Reveal>
          {!webgl && (
            <div className="range-fallback" aria-hidden="true">
              {PRODUCTS.map((p) => <Image key={p.id} src={p.render} alt="" width={160} height={320} />)}
            </div>
          )}
          <p className={cn('range-hover', hover !== null && 'is-on')} aria-hidden="true">{hover !== null ? PRODUCTS[hover].name : ''}</p>
          <ul className={cn('range-links dim-list fade', active && 'is-on')} style={{ transitionDelay: active ? '0.3s' : '0s' }}>
            {PRODUCTS.map((p) => (
              <li key={p.id}>
                <a href={productUrl(p)} target="_blank" rel="noreferrer">{p.name}</a>
              </li>
            ))}
          </ul>
        </>
      )}
    </Layer>
  );
}
