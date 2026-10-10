'use client';

import { useEffect, useRef } from 'react';
import { ASSESSMENT_URL, pad2, productGroups } from '@/lib/products';
import { sectionForProduct } from '@/lib/scroll/sections';
import { goToSection, scrollToId } from '@/lib/scroll/instance';
import { store, useApp } from '@/lib/store';
import { cn } from '@/lib/cn';

const GROUPS = productGroups();

// Full-screen Ink menu: the 12 products by category, FAQ and the assessment. Focus stays inside
// while it is open; Escape closes it and returns focus to the toggle.
export function Menu() {
  const open = useApp((s) => s.menuOpen);
  const panel = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const el = panel.current;
    if (!el) return;
    // Focus the panel itself: a tap that opens the menu should not draw a focus ring on the first product.
    el.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        store.set({ menuOpen: false });
        toggle.current?.focus();
        return;
      }
      if (e.key !== 'Tab' || !toggle.current) return;
      const items = [toggle.current, ...el.querySelectorAll<HTMLElement>('a[href], button')];
      // From the panel itself (where focus starts), Tab goes to the first product.
      const i = Math.max(0, items.indexOf(document.activeElement as HTMLElement));
      const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : i === items.length - 1 ? 0 : i + 1;
      e.preventDefault();
      items[next].focus();
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [open]);

  const close = () => store.set({ menuOpen: false });

  return (
    <>
      <button
        ref={toggle}
        type="button"
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => store.set({ menuOpen: !open })}
        className="menu-toggle"
      >
        <span className="menu-squares" aria-hidden="true"><i /><i /><i /><i /></span>
        <span className="max-sm:sr-only">{open ? 'Close' : 'Menu'}</span>
      </button>
      <div id="site-menu" ref={panel} role="dialog" aria-modal="true" aria-label="Menu" tabIndex={-1} data-lenis-prevent inert={!open} className={cn('menu-panel', open && 'is-open')}>
        <nav aria-label="Products" className="menu-grid">
          {GROUPS.map((g) => (
            <section key={g.category} className="menu-group">
              <h2 className="menu-group-title">{g.name}</h2>
              <ul className="dim-list">
                {g.items.map(({ product, index }) => (
                  <li key={product.id}>
                    <button type="button" className="menu-link" onClick={() => { close(); goToSection(sectionForProduct(index)); }}>
                      <span className="menu-num">{pad2(index + 1)}</span>
                      {product.name}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>
        <div className="menu-foot">
          <button type="button" className="nav-link" onClick={() => { close(); scrollToId('faq'); }}>FAQ</button>
          <a className="btn btn-primary" href={ASSESSMENT_URL} target="_blank" rel="noreferrer">Start assessment</a>
        </div>
      </div>
    </>
  );
}
