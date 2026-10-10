'use client';

import { Layer } from '@/components/ui/Layer';
import { Reveal } from '@/components/ui/Reveal';
import { GradientWaves } from '@/components/GradientWaves';

// Ciao-style statement: fast drifting light and rolling waves in the flavor colors, with the line set huge and
// translucent behind the can so the can stays the hero.
export function StatementLayer() {
  return (
    <Layer indices={[6]} back label="Take a hiatus">
      {(shown) => (
        <>
          <div aria-hidden="true" className="statement-aurora">
            <span className="aurora-blob aurora-blob--1" />
            <span className="aurora-blob aurora-blob--2" />
            <span className="aurora-blob aurora-blob--3" />
            <span className="aurora-blob aurora-blob--4" />
            <span className="aurora-blob aurora-blob--5" />
            {/* The hero's wave field, rolling much faster here. */}
            <GradientWaves visible={shown} speed={0.75} bold />
          </div>
          <div className="relative grid h-full place-items-center px-4 text-center">
            <h2 className="display statement-type text-[clamp(4rem,24vw,8rem)] md:text-[min(15vw,25vh)]">
              <Reveal as="span" show={shown} delay={0.15} className="block">
                Take a
              </Reveal>
              <Reveal as="span" show={shown} delay={0.3} className="block">
                hiatus.
              </Reveal>
            </h2>
            <Reveal show={shown} delay={0.6} className="eyebrow absolute inset-x-0 bottom-[6vh] text-[var(--d)]">
              Pause. Sip. Groove.
            </Reveal>
          </div>
        </>
      )}
    </Layer>
  );
}
