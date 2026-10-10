'use client';

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(SplitText, useGSAP);

type Mode = 'lines' | 'chars' | 'pop';

interface RevealProps {
  as?: ElementType;
  mode?: Mode;
  show: boolean;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export function Reveal({ as: Tag = 'div', mode = 'lines', show, delay = 0, className, style, children }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const split = useRef<SplitText | null>(null);
  const showRef = useRef(show);
  useEffect(() => {
    showRef.current = show; // read by onSplit when autoSplit re-splits on resize
  }, [show]);

  const targets = () => {
    const s = split.current;
    if (!s) return [];
    return mode === 'lines' ? s.lines : s.chars;
  };

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(el, { autoAlpha: showRef.current ? 1 : 0 });
        return;
      }
      split.current = SplitText.create(el, {
        type: mode === 'lines' ? 'lines' : 'lines,chars',
        mask: mode === 'pop' ? undefined : 'lines',
        autoSplit: true,
        onSplit: (self) => {
          const t = mode === 'lines' ? self.lines : self.chars;
          if (mode === 'pop') gsap.set(t, { scale: showRef.current ? 1 : 0.6, autoAlpha: showRef.current ? 1 : 0 });
          else gsap.set(t, { yPercent: showRef.current ? 0 : 110 });
        },
      });
      return () => split.current?.revert();
    },
    { scope: ref },
  );

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (!split.current) {
        gsap.to(el, { autoAlpha: show ? 1 : 0, duration: 0.4, delay: show ? delay : 0 });
        return;
      }
      const t = targets();
      gsap.killTweensOf(t);
      if (mode === 'pop') {
        if (show) gsap.fromTo(t, { scale: 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.6, stagger: 0.04, ease: 'back.out(2.2)', delay });
        else gsap.to(t, { scale: 0.8, autoAlpha: 0, duration: 0.3, stagger: 0.01 });
        return;
      }
      const chars = mode === 'chars';
      if (show) {
        gsap.fromTo(t, { yPercent: 110 }, {
          yPercent: 0, duration: chars ? 0.6 : 0.7, stagger: chars ? 0.01 : 0.08, ease: 'power3.out', delay,
        });
      } else {
        gsap.to(t, { yPercent: -110, duration: 0.4, stagger: 0.015, ease: 'power3.in' });
      }
    },
    { dependencies: [show], scope: ref },
  );

  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  );
}
