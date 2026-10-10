'use client';

import { useId, useState, type CSSProperties } from 'react';
import { cn } from '@/lib/cn';

// One duration for the height collapse and the delayed visibility flip, so a closing panel hides exactly when it is shut.
const COLLAPSE_MS = 500;

export function Accordion({ items }: { items: readonly { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const id = useId();
  return (
    <ul className="dim-list border-t border-ink/15">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <li key={it.q} className="border-b border-ink/15">
            <h3>
              <button
                type="button"
                id={`${id}-b${i}`}
                aria-expanded={isOpen}
                aria-controls={`${id}-p${i}`}
                onClick={() => {
                  setOpen(isOpen ? null : i);
                }}
                className="flex w-full items-center justify-between gap-6 py-6 text-left text-xl font-bold md:text-2xl"
              >
                {it.q}
                <span aria-hidden="true" className={cn('text-2xl transition-transform duration-500 motion-reduce:transition-none', isOpen && 'rotate-45')}>+</span>
              </button>
            </h3>
            <div
              id={`${id}-p${i}`}
              role="region"
              aria-labelledby={`${id}-b${i}`}
              inert={!isOpen}
              // A closing panel stays visible until it has collapsed, then drops out of the accessibility tree.
              style={{ '--acc-ms': `${COLLAPSE_MS}ms`, '--acc-delay': isOpen ? '0ms' : `${COLLAPSE_MS}ms` } as CSSProperties}
              className={cn('acc-panel grid', isOpen ? 'visible grid-rows-[1fr]' : 'invisible grid-rows-[0fr]')}
            >
              <div className="overflow-hidden">
                <p className="pr-10 pb-6 text-lg leading-relaxed text-ink/75">{it.a}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
