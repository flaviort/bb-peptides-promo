'use client';

import Image from 'next/image';
import { ASSESSMENT_URL } from '@/lib/products';
import { goToSection, scrollToId } from '@/lib/scroll/instance';
import { CLOSING } from '@/lib/scroll/sections';
import { store, useApp } from '@/lib/store';
import { RollLabel } from '@/components/ui/RollLabel';
import { IconArrow } from '@/components/ui/icons';
import { Menu } from './Menu';
import { cn } from '@/lib/cn';

export function Nav() {
  const entered = useApp((s) => s.entered);
  // Over the reading sections the nav gets its own Ink ground so copy never runs under it.
  const solid = useApp((s) => s.section === CLOSING);
  const menuOpen = useApp((s) => s.menuOpen);
  return (
    <header inert={!entered} className={cn('nav', entered && 'is-in', solid && 'is-solid', menuOpen && 'is-menu')}>
      <Menu />
      {/* The logo takes the page back to the hero; without JS the link simply reloads the top. */}
      <a
        className="nav-logo"
        href="/"
        aria-label="Bodybuilding Peptides +, powered by bodybuilding.com. Back to the top"
        onClick={(e) => {
          e.preventDefault();
          store.set({ menuOpen: false });
          goToSection(0);
        }}
      >
        <Image src="/logos/bb-peptides-full-white.svg" alt="" width={500} height={133} unoptimized priority />
      </a>
      <div className="nav-right">
        <button type="button" className="nav-link" onClick={() => scrollToId('faq')}>FAQ</button>
        <a className="btn btn-primary roll-host" href={ASSESSMENT_URL} target="_blank" rel="noreferrer" aria-label="Start assessment">
          <RollLabel text="Start assessment" />
          <IconArrow />
        </a>
      </div>
    </header>
  );
}
