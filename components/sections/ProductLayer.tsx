'use client';

import Image from 'next/image';
import { useEffect, useState, type CSSProperties } from 'react';
import { CATEGORIES, PRODUCTS, productUrl, type Product } from '@/lib/products';
import { FIRST_PRODUCT, LAST_PRODUCT, WALK_SECTIONS, productForSection } from '@/lib/scroll/sections';
import { goToSection } from '@/lib/scroll/instance';
import { store, useApp } from '@/lib/store';
import { Layer } from '@/components/ui/Layer';
import { Reveal } from '@/components/ui/Reveal';
import { RollLabel } from '@/components/ui/RollLabel';
import { IconArrow } from '@/components/ui/icons';
import { ProductRail } from './ProductRail';
import { cn } from '@/lib/cn';

const fadeDelay = (show: boolean, s: number): CSSProperties => ({ transitionDelay: show ? `${s}s` : '0s' });

function ProductPanel({ p, show, delay, current }: { p: Product; show: boolean; delay: number; current: boolean }) {
  return (
    <article className="product-panel" aria-hidden={current ? undefined : true} inert={!current}>
      <Reveal as="h2" show={show} delay={delay} className="display product-name">{p.name}</Reveal>
      <Reveal as="p" show={show} delay={delay + 0.05} className="product-cat">{CATEGORIES[p.category].name}</Reveal>
      <Reveal as="p" show={show} delay={delay + 0.1} className="product-about">{p.about}</Reveal>
      <dl className={cn('product-specs fade', show && 'is-on')} style={fadeDelay(show, delay + 0.2)}>
        <div><dt>Strength</dt><dd>{p.strength}</dd></div>
        <div><dt>Format</dt><dd>Injectable, {p.vial} vial</dd></div>
      </dl>
      <ul className={cn('product-focus fade', show && 'is-on')} style={fadeDelay(show, delay + 0.26)}>
        {p.focus.map((f) => <li key={f}>{f}</li>)}
      </ul>
      <div className={cn('product-actions fade', show && 'is-on')} style={fadeDelay(show, delay + 0.32)}>
        <a className="btn btn-primary roll-host" href={productUrl(p)} target="_blank" rel="noreferrer" aria-label={`View ${p.name} on trybbpeptides.com`}>
          <RollLabel text="View product" />
          <IconArrow />
        </a>
      </div>
    </article>
  );
}

// The outgoing panel leaves upward while the new one reveals, so copy swaps with the label on the vial.
function PanelStack({ index, show }: { index: number; show: boolean }) {
  const [items, setItems] = useState([{ index, n: 0 }]);
  const last = items[items.length - 1];
  if (last.index !== index) setItems([last, { index, n: last.n + 1 }]);
  return (
    <div className="product-stack">
      {items.map((it, i) => {
        const current = i === items.length - 1;
        return <ProductPanel key={it.n} p={PRODUCTS[it.index]} show={show && current} delay={current ? 0.3 : 0} current={current} />;
      })}
    </div>
  );
}

export function ProductLayer() {
  const index = useApp((s) => s.product);
  const section = useApp((s) => s.section);
  const webgl = useApp((s) => s.webgl);
  const p = PRODUCTS[index];

  // Left and right arrows step through the walk.
  useEffect(() => {
    if (productForSection(section) === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (store.get().menuOpen || e.altKey || e.metaKey || e.ctrlKey || e.shiftKey || e.defaultPrevented) return;
      if (e.key === 'ArrowRight' && section < LAST_PRODUCT) goToSection(section + 1);
      if (e.key === 'ArrowLeft' && section > FIRST_PRODUCT) goToSection(section - 1);
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [section]);

  return (
    <>
      {/* The outlined name sits behind the vial, so it gets a layer under the canvas. */}
      <Layer indices={WALK_SECTIONS} back>
        {() => <p className="product-ghost">{p.short}</p>}
      </Layer>
      <Layer indices={WALK_SECTIONS} label="Product details">
        {(active) => (
          <>
            {!webgl && <Image className="product-fallback" src={p.render} alt={`${p.name} vial`} width={320} height={640} />}
            <PanelStack index={index} show={active} />
            <ProductRail current={index} />
          </>
        )}
      </Layer>
    </>
  );
}
