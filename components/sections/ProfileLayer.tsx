'use client';

import { FLAVORS, doseLabel } from '@/lib/flavors';
import { useApp } from '@/lib/store';
import { Layer } from '@/components/ui/Layer';
import { Reveal } from '@/components/ui/Reveal';
import { ClaimRail } from './ClaimRail';
import { cn } from '@/lib/cn';

export function ProfileLayer() {
  const f = FLAVORS[useApp((s) => s.flavor)];
  return (
    <Layer indices={[1]} label="Flavor profile">
      {(active) => (
        <>
          <div className="absolute left-[4%] top-1/2 w-[min(30rem,34vw)] -translate-y-1/2 max-md:inset-x-4 max-md:bottom-[4vh] max-md:top-auto max-md:w-auto max-md:translate-y-0 max-md:text-center">
            <Reveal show={active} className="eyebrow text-[var(--d)]">Flavor profile</Reveal>
            <Reveal key={f.id} as="h2" show={active} delay={0.1} className="display mt-4 text-[clamp(2.6rem,3.4vw,3.75rem)] text-[var(--d)]">
              {f.lines.map((l) => (
                <span key={l} className="block">{l}</span>
              ))}
            </Reveal>
            <Reveal key={`${f.id}-d`} show={active} delay={0.2} className="mt-5 text-lg leading-snug text-ink/75 max-md:hidden">
              {f.short}
            </Reveal>
            <div className={cn('mt-7 flex flex-wrap gap-2 transition-opacity duration-500 max-md:justify-center', active ? 'opacity-100 delay-300' : 'opacity-0')}>
              <span className="chip bg-white/95">{doseLabel(f)}</span>
              <span className="chip bg-white/95">{f.juicePct}% organic juice</span>
              <span className="chip bg-white/95">{f.calories} calories</span>
            </div>
          </div>
          <ClaimRail highlight={-1} />
        </>
      )}
    </Layer>
  );
}
