'use client';

import { FAQS } from '@/lib/content';
import { CLOSING } from '@/lib/scroll/sections';
import { useApp } from '@/lib/store';
import { Reveal } from '@/components/ui/Reveal';
import { Accordion } from '@/components/ui/Accordion';

export function FaqSection() {
  const shown = useApp((s) => s.entered && s.section === CLOSING);
  return (
    <section id="faq" aria-labelledby="faq-title" className="closing-block faq">
      <Reveal as="h2" show={shown} className="display closing-title"><span id="faq-title">Questions, answered</span></Reveal>
      <div className="faq-list">
        <Accordion items={FAQS} />
      </div>
    </section>
  );
}
