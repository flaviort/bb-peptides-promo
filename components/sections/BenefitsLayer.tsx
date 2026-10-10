'use client';

import { BENEFITS } from '@/lib/content';
import { FLAVORS } from '@/lib/flavors';
import { useApp } from '@/lib/store';
import { Layer } from '@/components/ui/Layer';
import { Reveal } from '@/components/ui/Reveal';
import { ClaimRail } from './ClaimRail';
import { cn } from '@/lib/cn';

export function BenefitsLayer() {
  const f = FLAVORS[useApp((s) => s.flavor)];
  return (
    <Layer indices={[2, 3, 4, 5]} label="How it feels">
      {(active, section) => (
        <>
          {BENEFITS.map((b, i) => {
            const shown = active && section === 2 + i;
            return (
              <div
                key={b.kicker}
                aria-hidden={!shown}
                className={cn(
                  'absolute left-[4%] top-1/2 w-[min(28rem,32vw)] -translate-y-1/2 max-md:inset-x-4 max-md:bottom-[4vh] max-md:top-auto max-md:w-auto max-md:translate-y-0 max-md:text-center',
                  shown ? 'is-shown opacity-100' : 'opacity-0 [transition:opacity_0s_linear_0.7s]',
                )}
              >
                <Reveal show={shown} delay={0.35} className="font-mono text-sm text-[var(--d)] max-md:hidden">
                  {b.kicker} / 04
                </Reveal>
                <Reveal as="h2" show={shown} delay={0.4} className="display mt-4 text-balance text-[clamp(2.4rem,4vw,4.25rem)] max-md:mt-0 max-md:text-[2.1rem] text-[var(--d)]">
                  {b.title(f)}
                </Reveal>
                <Reveal show={shown} delay={0.5} className="mt-5 text-lg leading-snug text-ink/75 max-md:mt-3 max-md:text-base">
                  {b.body(f)}
                </Reveal>
              </div>
            );
          })}
          <ClaimRail highlight={section - 2} />
        </>
      )}
    </Layer>
  );
}
