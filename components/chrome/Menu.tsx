'use client';

import { useEffect, useRef } from 'react';
import { store, useApp } from '@/lib/store';
import { NAV_LINKS } from '@/lib/content';
import { PRODUCT_URL } from '@/lib/flavors';
import { goToSection } from '@/lib/scroll/instance';
import { RollLabel } from '@/components/ui/RollLabel';
import { IconArrow } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

export function Menu() {
  const open = useApp((s) => s.menuOpen);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && store.set({ menuOpen: false });
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) store.set({ menuOpen: false });
    };
    addEventListener('keydown', onKey);
    addEventListener('pointerdown', onDown);
    return () => {
      removeEventListener('keydown', onKey);
      removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  const go = (section: number) => {
    store.set({ menuOpen: false });
    goToSection(section);
  };

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => {
          store.set({ menuOpen: !open });
        }}
        className="roll-host pointer-events-auto relative z-10 flex min-h-11 items-center gap-3 rounded-full px-1 text-xs font-bold tracking-[0.16em] uppercase"
      >
        <span className="grid grid-cols-2 gap-[3px]" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <svg key={i} width="4" height="4" viewBox="0 0 4 4">
              <circle cx="2" cy="2" r="2" fill="currentColor" className="dot-pulse" style={{ animationDelay: `${i * 80}ms` }} />
            </svg>
          ))}
        </span>
        {open ? 'Close' : 'Menu'}
      </button>
      <nav
        id="site-menu"
        aria-label="Site"
        className={cn(
          'menu-panel pointer-events-auto absolute right-0 top-[calc(100%+0.75rem)] w-[19rem] overflow-hidden rounded-2xl p-2',
          'max-md:fixed max-md:inset-0 max-md:top-0 max-md:w-auto max-md:rounded-none max-md:p-0',
          open ? 'is-open' : '',
        )}
        inert={!open}
      >
        <div className="max-md:flex max-md:h-full max-md:flex-col max-md:justify-center max-md:px-6">
          <ul className="dim-list">
            {NAV_LINKS.map((l, i) => (
              <li key={l.label} className="menu-item">
                <button type="button" onClick={() => go(l.section)} className="menu-link roll-host group">
                  <span className="font-mono text-[0.7rem] text-ink/40">{String(i + 1).padStart(2, '0')}</span>
                  <span className="flex-1 text-left" aria-label={l.label}>
                    <RollLabel text={l.label} />
                  </span>
                  <span className="menu-arrow" aria-hidden="true">
                    <IconArrow dir={1} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <a href={PRODUCT_URL} target="_blank" rel="noreferrer" aria-label="Shop Hiatus" className="menu-shop roll-host btn btn-primary mt-2 w-full">
            <RollLabel text="Shop Hiatus" />
          </a>
        </div>
      </nav>
    </div>
  );
}
