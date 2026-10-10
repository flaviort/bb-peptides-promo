'use client';

import { FAQS } from '@/lib/content';
import { useApp } from '@/lib/store';
import { Reveal } from '@/components/ui/Reveal';
import { Accordion } from '@/components/ui/Accordion';
import { Newsletter } from './Newsletter';
import { Footer } from './Footer';

export function FaqSection() {
  const shown = useApp((s) => s.entered && s.section === 8);
  return (
    <section data-section="faq" aria-labelledby="faq-title" className="pointer-events-auto relative min-h-[173vh] px-[4%] pt-20 max-md:px-4">
      {/* One centered column, as on Ciao. The cans leave the frame for this part (see the faq keyframe). */}
      <div className="mx-auto max-w-[44rem] text-center">
        <Reveal as="p" show={shown} className="eyebrow text-[var(--d)]">Questions</Reveal>
        <Reveal as="h2" show={shown} delay={0.1} className="display mt-4 text-[clamp(3rem,6vw,6.5rem)] text-[var(--d)]">
          <span id="faq-title">Good to know</span>
        </Reveal>
        <div className="mt-12 text-left">
          <Accordion items={FAQS} />
        </div>
        <Newsletter />
      </div>
      {/* The footer gets a wider measure than the FAQ column so the legal lines stay short in count. */}
      <div className="mx-auto max-w-[72rem]">
        <Footer />
      </div>
    </section>
  );
}
