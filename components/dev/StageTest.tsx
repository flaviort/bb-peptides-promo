'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { PRODUCTS, PRODUCT_COUNT } from '@/lib/products';
import { SECTIONS, LAST } from '@/lib/scroll/sections';
import { buildKeyframes } from '@/lib/stage/keyframes';
import { buildMasterTimeline } from '@/lib/scroll/timeline';
import type { Stage } from '@/lib/stage/Stage';

export function StageTest() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const stage = useRef<Stage | null>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const [time, setTime] = useState(0);
  const [product, setProduct] = useState(0);

  useEffect(() => {
    let alive = true;
    let tick: ((t: number, d: number) => void) | null = null;
    const onResize = () => stage.current?.resize();
    import('@/lib/stage/Stage').then(async ({ Stage }) => {
      await document.fonts.ready;
      const family = getComputedStyle(document.documentElement).getPropertyValue('--font-poppins').trim() || 'Poppins, sans-serif';
      const s = new Stage({ canvas: canvas.current!, quality: 'high', labelFont: family, background: '#111111', reduced: false });
      await s.load();
      if (!alive) return s.dispose();
      s.intro = 1;
      stage.current = s;
      tl.current = buildMasterTimeline(s.values, buildKeyframes(innerWidth < 760));
      // Dev-only deep link for screenshots: ?t=<timeline time>&product=<index>.
      const q = new URLSearchParams(location.search);
      const t = Math.min(LAST, Math.max(0, Number(q.get('t')) || 0));
      const p = (Number(q.get('product')) || 0) % PRODUCT_COUNT;
      tl.current.time(t);
      setTime(t);
      setProduct(p);
      s.setProduct(p);
      tick = (_t, d) => s.render(d / 1000);
      gsap.ticker.add(tick);
      addEventListener('resize', onResize);
    });
    return () => {
      alive = false;
      removeEventListener('resize', onResize);
      if (tick) gsap.ticker.remove(tick);
      stage.current?.dispose();
    };
  }, []);

  useEffect(() => {
    tl.current?.time(time);
  }, [time]);

  const pick = (i: number) => {
    const n = (i + PRODUCT_COUNT) % PRODUCT_COUNT;
    setProduct(n);
    stage.current?.setProduct(n);
  };

  return (
    <div className="fixed inset-0 bg-ink">
      <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-x-4 bottom-4 flex items-center gap-3 bg-white/10 p-3 text-xs text-white">
        <button onClick={() => pick(product - 1)}>prev</button>
        <span className="w-44">{PRODUCTS[product].name}</span>
        <button onClick={() => pick(product + 1)}>next</button>
        <input className="flex-1" type="range" min={0} max={LAST} step={0.01} value={time} onChange={(e) => setTime(+e.target.value)} />
        <span className="w-40 tabular">{time.toFixed(2)} {SECTIONS[Math.min(LAST, Math.round(time))]}</span>
      </div>
    </div>
  );
}
