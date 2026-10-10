'use client';

import Image from 'next/image';
import { useApp } from '@/lib/store';
import { PRODUCT_URL } from '@/lib/flavors';
import { goToSection } from '@/lib/scroll/instance';
import { RollLabel } from '@/components/ui/RollLabel';
import { Menu } from './Menu';
import { cn } from '@/lib/cn';

export function Nav() {
  const entered = useApp((s) => s.entered);
  return (
    <header
      inert={!entered}
      className={cn(
        'pointer-events-none fixed inset-x-0 top-0 z-[5] flex h-28 items-center justify-between px-[4%] text-ink max-md:h-20 max-md:px-4',
        'transition-transform duration-900 ease-[var(--ease-out-3)]',
        entered ? 'delay-300' : '-translate-y-full',
      )}
    >
      <button type="button" onClick={() => goToSection(0)} className="pointer-events-auto grid min-h-11 min-w-11 place-items-center" aria-label="Hiatus, back to top">
        <Image src="/placeholders/hiatus-logo.svg" alt="" width={120} height={40} unoptimized loading="eager" className="h-12 w-auto md:h-20" />
      </button>
      <div className="flex items-center justify-end gap-6">
        <Menu />
        <span className="max-md:hidden">
          <a
            href={PRODUCT_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Shop now"
            className="roll-host btn btn-primary pointer-events-auto"
          >
            <RollLabel text="Shop now" />
          </a>
        </span>
      </div>
    </header>
  );
}
