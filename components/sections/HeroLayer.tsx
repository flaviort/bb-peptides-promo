'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { CATEGORIES, PRODUCTS } from '@/lib/products';
import { selectProduct, store, useApp } from '@/lib/store';
import { Layer } from '@/components/ui/Layer';
import { Reveal } from '@/components/ui/Reveal';
import { IconChevron } from '@/components/ui/icons';

// The outgoing name animates up and out while the new one reveals by character.
function ProductTitle({ index, show }: { index: number; show: boolean }) {
  const [items, setItems] = useState([{ index, n: 0 }]);
  const last = items[items.length - 1];
  if (last.index !== index) setItems([last, { index, n: last.n + 1 }]);
  return (
    <div className="hero-title-stack">
      {items.map((it, i) => {
        const current = i === items.length - 1;
        return (
          <div key={it.n} aria-hidden={current ? undefined : true}>
            <Reveal as="h1" mode="chars" show={show && current} delay={current ? 0.25 : 0} className="display hero-title">
              {PRODUCTS[it.index].name}
            </Reveal>
          </div>
        );
      })}
    </div>
  );
}

function Arrow({ dir }: { dir: 1 | -1 }) {
  return (
    <button
      type="button"
      className="btn-square"
      aria-label={dir > 0 ? 'Next product' : 'Previous product'}
      onClick={() => selectProduct(store.get().product + dir)}
    >
      <IconChevron dir={dir} />
    </button>
  );
}

export function HeroLayer() {
  const index = useApp((s) => s.product);
  const webgl = useApp((s) => s.webgl);
  const section = useApp((s) => s.section);
  const p = PRODUCTS[index];

  useEffect(() => {
    if (section !== 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (store.get().menuOpen || !store.get().entered) return;
      if (e.altKey || e.metaKey || e.ctrlKey || e.shiftKey || e.defaultPrevented) return;
      if (e.key === 'ArrowRight') selectProduct(store.get().product + 1);
      if (e.key === 'ArrowLeft') selectProduct(store.get().product - 1);
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [section]);

  return (
    <Layer indices={[0]} label="All products">
      {(active) => (
        <>
          {!webgl && <Image className="hero-fallback" src={p.render} alt={`${p.name} vial`} width={320} height={640} priority />}
          <Reveal as="p" show={active} delay={0.2} className="hero-tagline">Physician-guided peptides. Started 100% online.</Reveal>
          <div className="hero-title-block">
            <div className="hero-name-row">
              <Arrow dir={-1} />
              <ProductTitle index={index} show={active} />
              <Arrow dir={1} />
            </div>
            <p className="hero-meta">
              <span>{CATEGORIES[p.category].name}</span>
              <i aria-hidden="true" />
              <span className="hero-meta-vial">{p.vial} vial</span>
            </p>
            <div className="hero-track" role="group" aria-label="Choose a product">
              {PRODUCTS.map((q, i) => (
                <button key={q.id} type="button" aria-label={q.name} aria-pressed={i === index} onClick={() => selectProduct(i)} />
              ))}
            </div>
          </div>
          <Reveal show={active} delay={0.35} className="hero-hint">
            <span className="hero-hint-line" aria-hidden="true" />
            Scroll to explore
          </Reveal>
        </>
      )}
    </Layer>
  );
}
