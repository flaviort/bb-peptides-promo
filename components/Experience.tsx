'use client';

import { useEffect, useRef } from 'react';

// Boots run one after another: in dev strict mode the effect mounts, cleans up and mounts
// again on the same canvas, and two Stages must never share its WebGL context at once.
let queue: Promise<void> = Promise.resolve();

export function Experience() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let dispose: (() => void) | undefined;
    let cancelled = false;
    queue = queue
      .then(async () => {
        if (cancelled) return;
        const { boot } = await import('@/lib/boot');
        if (cancelled) return;
        const d = await boot(canvas);
        if (cancelled) d();
        else dispose = d;
      })
      .catch((err: unknown) => console.error(err));
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="stage-canvas" />;
}
