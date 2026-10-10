'use client';

import { CANDIDATE_NOTE, HOW_IT_WORKS } from '@/lib/content';
import { pad2 } from '@/lib/products';
import { CLOSING } from '@/lib/scroll/sections';
import { useApp } from '@/lib/store';
import { Reveal } from '@/components/ui/Reveal';
import { cn } from '@/lib/cn';

export function HowItWorks() {
  const shown = useApp((s) => s.entered && s.section === CLOSING);
  return (
    <section aria-labelledby="how-title" className="closing-block how">
      <Reveal as="h2" show={shown} className="display closing-title"><span id="how-title">How it works</span></Reveal>
      <ol className={cn('how-steps fade', shown && 'is-on')} style={{ transitionDelay: shown ? '0.2s' : '0s' }}>
        {HOW_IT_WORKS.map((s, i) => (
          <li key={s.title}>
            <span className="how-num">{pad2(i + 1)}</span>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </li>
        ))}
      </ol>
      <p className="how-note">{CANDIDATE_NOTE}</p>
    </section>
  );
}
