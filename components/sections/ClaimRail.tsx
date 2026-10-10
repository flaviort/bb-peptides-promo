'use client';

import type { MouseEvent } from 'react';
import { CLAIMS } from '@/lib/content';
import { BENEFIT_ICONS } from '@/components/ui/icons';
import { goToSection } from '@/lib/scroll/instance';
import { sectionIndex, type SectionId } from '@/lib/scroll/sections';
import { cn } from '@/lib/cn';

// Each claim links to its benefit section. The href keeps it a real anchor (shareable, opens
// in a new tab); a plain click pages there with the usual glide instead of a jump.
export function ClaimRail({ highlight }: { highlight: number }) {
  return (
    <ul className="absolute right-[4%] top-1/2 grid -translate-y-1/2 gap-3 max-md:top-[42%] max-md:gap-2">
      {CLAIMS.map((c, i) => {
        const Icon = BENEFIT_ICONS[c.icon];
        const on = i === highlight;
        const id = `benefit-${i + 1}` as SectionId;
        const go = (e: MouseEvent<HTMLAnchorElement>) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
          e.preventDefault();
          history.replaceState(null, '', `#${id}`);
          goToSection(sectionIndex(id));
        };
        return (
          <li key={c.icon}>
            <a href={`#${id}`} onClick={go} aria-current={on ? 'step' : undefined} className="claim-link group flex items-center justify-end gap-3">
              <span className={cn('eyebrow transition-colors duration-300 max-md:sr-only', on ? 'text-ink' : 'text-ink/70 group-hover:text-ink')}>
                {c.label}
              </span>
              <span
                className={cn(
                  'claim-dot grid size-12 place-items-center rounded-full max-md:size-10',
                  on ? 'is-on text-[var(--d)]' : 'text-ink/60 group-hover:text-ink',
                )}
              >
                <Icon />
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
