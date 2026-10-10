'use client';

import Image from 'next/image';
import { useEffect, useState, type CSSProperties } from 'react';
import { store, useApp } from '@/lib/store';
import { cn } from '@/lib/cn';

// Ink screen, the B-mark fills from the bottom with real loading progress, then the page enters.
export function Preloader() {
  const loaded = useApp((s) => s.loaded);
  const ready = useApp((s) => s.ready);
  const entered = useApp((s) => s.entered);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (!ready || entered) return;
    const t = setTimeout(() => store.set({ entered: true }), 400);
    return () => clearTimeout(t);
  }, [ready, entered]);

  useEffect(() => {
    if (!entered) return;
    const t = setTimeout(() => setGone(true), 1000);
    return () => clearTimeout(t);
  }, [entered]);

  if (gone) return null;
  const pct = Math.round(loaded * 100);

  return (
    <div className={cn('preloader', entered && 'is-leaving')} role="status" aria-live="polite" aria-label={`Loading, ${pct}%`}>
      <div className="preloader-mark" style={{ '--p': loaded } as CSSProperties} aria-hidden="true">
        <Image className="is-ghost" src="/logos/b-mark-white.svg" alt="" width={88} height={67} priority unoptimized />
        <Image className="is-fill" src="/logos/b-mark-white.svg" alt="" width={88} height={67} priority unoptimized />
      </div>
      <p className="preloader-count" aria-hidden="true">{String(pct).padStart(2, '0')}%</p>
    </div>
  );
}
