'use client';

import { useEffect, useRef } from 'react';
import { armBootFallback } from '@/lib/fallback';

// Boots run one after another: in dev strict mode the effect mounts, cleans up and mounts
// again on the same canvas, and two Stages must never share its WebGL context at once.
let queue: Promise<void> = Promise.resolve();

export function Experience() {
  const ref = useRef<HTMLCanvasElement>(null);
  const dustRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const dustCanvas = dustRef.current;
    if (!canvas || !dustCanvas) return;
    let dispose: (() => void) | undefined;
    let cancelled = false;
    // Boot races its own 8s deadline; this covers the boot chunk itself stalling or boot throwing.
    const cancelFallback = armBootFallback(10000);
    queue = queue
      .then(async () => {
        if (cancelled) return;
        const { boot } = await import('@/lib/boot');
        if (cancelled) return;
        const d = await boot(canvas, dustCanvas);
        if (cancelled) d();
        else dispose = d;
      })
      .catch((err: unknown) => console.error(err));
    return () => {
      cancelled = true;
      cancelFallback();
      dispose?.();
    };
  }, []);

  return (
    <>
      <canvas ref={ref} aria-hidden="true" className="stage-canvas" />
      <canvas ref={dustRef} aria-hidden="true" className="dust-canvas" />
    </>
  );
}
