'use client';

import { useId, useState, type CSSProperties } from 'react';
import { IconPlus } from './icons';
import { cn } from '@/lib/cn';

// One duration for the height collapse and the delayed visibility flip, so a closing panel hides exactly when it is shut.
const COLLAPSE_MS = 500;

export function Accordion({ items }: { items: readonly { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const id = useId();
  return (
    <ul className="acc dim-list">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <li key={it.q}>
            <h3>
              <button
                type="button"
                id={`${id}-b${i}`}
                aria-expanded={isOpen}
                aria-controls={`${id}-p${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="acc-button"
              >
                {it.q}
                <span className="acc-icon"><IconPlus /></span>
              </button>
            </h3>
            <div
              id={`${id}-p${i}`}
              role="region"
              aria-labelledby={`${id}-b${i}`}
              inert={!isOpen}
              style={{ '--acc-ms': `${COLLAPSE_MS}ms`, '--acc-delay': isOpen ? '0ms' : `${COLLAPSE_MS}ms` } as CSSProperties}
              className={cn('acc-panel grid', isOpen ? 'visible grid-rows-[1fr]' : 'invisible grid-rows-[0fr]')}
            >
              <div className="overflow-hidden">
                <p className="acc-answer">{it.a}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
