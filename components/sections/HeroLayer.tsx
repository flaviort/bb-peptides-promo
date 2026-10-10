'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { FLAVORS, type Flavor } from '@/lib/flavors';
import { selectFlavor, store, useApp } from '@/lib/store';
import { Layer } from '@/components/ui/Layer';
import { Reveal } from '@/components/ui/Reveal';
import { IconArrow } from '@/components/ui/icons';

function FlavorTitle({ flavor, show }: { flavor: Flavor; show: boolean }) {
  const [items, setItems] = useState([{ id: flavor.id, n: 0 }]);
  const last = items[items.length - 1];
  if (last.id !== flavor.id) setItems([last, { id: flavor.id, n: last.n + 1 }]);
  return (
    <div className="grid place-items-center">
      {items.map((it, i) => {
        const f = FLAVORS.find((x) => x.id === it.id)!;
        const current = i === items.length - 1;
        return (
          <div key={it.n} aria-hidden={current ? undefined : true} className="col-start-1 row-start-1">
            <Reveal
              as="h1"
              mode="chars"
              show={show && current}
              delay={current ? 0.25 : 0}
              className="display text-center text-[clamp(2.6rem,5vw,5.5rem)] text-[var(--d)] md:whitespace-nowrap md:text-[clamp(2.4rem,4vw,4.75rem)]"
            >
              {f.lines.map((l, i) => (
                <span key={l} className="block md:inline">
                  {i > 0 && ' '}
                  {l}
                </span>
              ))}
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
      aria-label={dir > 0 ? 'Next flavor' : 'Previous flavor'}
      onClick={() => {
        selectFlavor(store.get().flavor + dir);
      }}
      className="hero-arrow group"
      data-dir={dir > 0 ? 'next' : 'prev'}
    >
      <IconArrow dir={dir} />
    </button>
  );
}

export function HeroLayer() {
  const flavorIdx = useApp((s) => s.flavor);
  const webgl = useApp((s) => s.webgl);
  const section = useApp((s) => s.section);
  const f = FLAVORS[flavorIdx];

  useEffect(() => {
    if (section !== 0) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (store.get().menuOpen || !store.get().entered) return;
      if (e.altKey || e.metaKey || e.ctrlKey || e.shiftKey || e.defaultPrevented) return;
      if ((e.target as HTMLElement).closest?.('input, textarea, select, [contenteditable]')) return;
      if (e.key === 'ArrowRight') selectFlavor(store.get().flavor + 1);
      if (e.key === 'ArrowLeft') selectFlavor(store.get().flavor - 1);
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [section]);

  return (
    <Layer indices={[0]} label="Flavors">
      {(active) => (
        <>
          {!webgl && (
            <Image
              src={f.images.product}
              alt={`${f.name} can`}
              width={480}
              height={960}
              priority
              className="absolute left-1/2 top-1/2 h-[60vh] w-auto -translate-x-1/2 -translate-y-1/2 object-contain"
            />
          )}
          <div className="absolute left-1/2 top-[45%] flex w-[min(53vh,62vw)] -translate-x-1/2 -translate-y-1/2 justify-between max-md:w-[88vw]">
            <Arrow dir={-1} />
            <Arrow dir={1} />
          </div>
          {/* Title keeps its old spot (7vh plus the hint and gap that used to sit under it). */}
          <div className="absolute inset-x-0 bottom-[calc(7vh+1.625rem)] grid justify-items-center px-4">
            <FlavorTitle flavor={f} show={active} />
          </div>
          <Reveal show={active} delay={0.35} className="eyebrow absolute inset-x-0 bottom-[5vh] text-center text-[0.625rem] font-medium tracking-[0.22em] text-ink/45">
            Scroll to discover
          </Reveal>
        </>
      )}
    </Layer>
  );
}
