'use client';

import { useEffect, useRef, useSyncExternalStore, type RefObject } from 'react';
import { store } from '@/lib/store';

// A phone held sideways: the stage, the walk and the panels are laid out for portrait only.
const QUERY = '(orientation: landscape) and (max-height: 500px) and (pointer: coarse)';

const subscribe = (fn: () => void) => {
  const mq = matchMedia(QUERY);
  mq.addEventListener('change', fn);
  return () => mq.removeEventListener('change', fn);
};
const getSnapshot = () => matchMedia(QUERY).matches;
const getServerSnapshot = () => false;

// TV static: a tiny canvas of random grey cells, tinted toward Light Blue and scaled up without smoothing.
function useStatic(canvas: RefObject<HTMLCanvasElement | null>, on: boolean) {
  useEffect(() => {
    const c = canvas.current;
    if (!on || !c) return;
    const g = c.getContext('2d');
    if (!g) return;
    const img = g.createImageData(c.width, c.height);
    const px = img.data;
    const draw = () => {
      for (let i = 0; i < px.length; i += 4) {
        const v = Math.random() * 255;
        px[i] = v * 0.78;
        px[i + 1] = v * 0.86;
        px[i + 2] = v;
        px[i + 3] = 255;
      }
      g.putImageData(img, 0, 0);
    };
    draw();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // About 24 frames a second, like the real thing; faster only costs battery.
    const id = setInterval(draw, 42);
    return () => clearInterval(id);
  }, [canvas, on]);
}

export function RotateNotice() {
  const rotated = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const noise = useRef<HTMLCanvasElement>(null);
  useStatic(noise, rotated);

  useEffect(() => {
    store.set({ rotated });
  }, [rotated]);

  if (!rotated) return null;
  return (
    <div className="rotate" role="dialog" aria-modal="true" aria-labelledby="rotate-title">
      <canvas ref={noise} className="rotate-noise" width={160} height={90} aria-hidden="true" />
      <div className="rotate-scan" aria-hidden="true" />
      <div className="rotate-copy">
        <svg className="rotate-icon" viewBox="0 0 64 64" fill="none" strokeWidth="1.8" aria-hidden="true">
          <g className="rotate-phone" stroke="#fff">
            <rect x="22" y="12" width="20" height="38" />
            <path d="M29 45h6" />
          </g>
          {/* A quarter turn around the phone, the way it should go. */}
          <path className="rotate-arrow" d="M41 6.6A26 26 0 0 1 57.6 35.5M57.6 35.5l-5-2.4M57.6 35.5l1.2-5.4" stroke="#89B5FC" />
        </svg>
        <h2 id="rotate-title" className="display rotate-title">Turn your phone upright</h2>
        <p className="rotate-line">This page is built for portrait.</p>
      </div>
    </div>
  );
}
