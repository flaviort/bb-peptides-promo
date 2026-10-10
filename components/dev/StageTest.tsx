'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { FLAVORS } from '@/lib/flavors';
import { SECTIONS, LAST } from '@/lib/scroll/sections';
import { buildKeyframes } from '@/lib/stage/keyframes';
import { buildMasterTimeline } from '@/lib/scroll/timeline';
import type { Stage } from '@/lib/stage/Stage';

export function StageTest() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const stage = useRef<Stage | null>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const [time, setTime] = useState(0);
  const [flavor, setFlavor] = useState(0);

  useEffect(() => {
    let alive = true;
    let tick: ((t: number, d: number) => void) | null = null;
    import('@/lib/stage/Stage').then(async ({ Stage }) => {
      const s = new Stage({ canvas: canvas.current!, quality: 'high', labels: FLAVORS.map((f) => f.label.hi), background: '#F6EDDC' });
      await s.load();
      if (!alive) return s.dispose();
      s.intro = 1;
      stage.current = s;
      tl.current = buildMasterTimeline(s.values, buildKeyframes(innerWidth < 760));
      // Dev-only deep link for screenshots: ?t=<timeline time>&flavor=<index>.
      const q = new URLSearchParams(location.search);
      const t = Math.min(LAST, Math.max(0, Number(q.get('t')) || 0));
      const f = Number(q.get('flavor')) || 0;
      tl.current.time(t);
      setTime(t);
      if (f) {
        setFlavor(f % FLAVORS.length);
        s.setFlavor(f % FLAVORS.length);
      }
      tick = (_t, d) => s.render(d / 1000);
      gsap.ticker.add(tick);
      addEventListener('resize', onResize);
    });
    const onResize = () => stage.current?.resize();
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
    const n = (i + FLAVORS.length) % FLAVORS.length;
    setFlavor(n);
    stage.current?.setFlavor(n);
  };

  return (
    <div className="fixed inset-0 bg-cream">
      <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-xl bg-ink/85 p-3 font-mono text-xs text-cream">
        <button onClick={() => pick(flavor - 1)}>prev</button>
        <span className="w-28">{FLAVORS[flavor].name}</span>
        <button onClick={() => pick(flavor + 1)}>next</button>
        <input className="flex-1" type="range" min={0} max={LAST} step={0.01} value={time} onChange={(e) => setTime(+e.target.value)} />
        <span className="w-40">{time.toFixed(2)} {SECTIONS[Math.min(LAST, Math.round(time))]}</span>
      </div>
    </div>
  );
}
