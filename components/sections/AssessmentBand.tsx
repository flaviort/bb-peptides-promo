'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { ASSESSMENT_URL } from '@/lib/products';
import { RollLabel } from '@/components/ui/RollLabel';
import { IconArrow } from '@/components/ui/icons';

// The one full Electric Blue field on the page, at the moment we ask for the action.
// The video loads only as the band nears the viewport and pauses when it leaves.
export function AssessmentBand() {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!v.getAttribute('src')) v.src = '/video/couple.mp4';
          if (!reduced) void v.play().catch(() => undefined);
        } else {
          v.pause();
        }
      },
      { rootMargin: '200px' },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <section aria-labelledby="band-title" className="band">
      <video ref={video} className="band-video" muted loop playsInline preload="none" poster="/video/couple-poster.jpg" aria-hidden="true" />
      <div className="band-inner">
        <div>
          <Image className="band-mark" src="/logos/b-mark-white.svg" alt="" width={88} height={67} unoptimized />
          <h2 id="band-title" className="display band-title">Are peptides for you?</h2>
          <p className="band-copy">Start your assessment today. It is 100% online, and a licensed provider reviews every one.</p>
        </div>
        <a className="btn btn-primary roll-host" href={ASSESSMENT_URL} target="_blank" rel="noreferrer" aria-label="Start your assessment">
          <RollLabel text="Start your assessment" />
          <IconArrow />
        </a>
      </div>
    </section>
  );
}
