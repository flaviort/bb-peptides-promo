'use client';

import { CLOSING } from '@/lib/scroll/sections';
import { useApp } from '@/lib/store';
import { cn } from '@/lib/cn';

// Corner brackets and the top progress line (its width is --progress, set in lib/boot.ts).
// Position within the products is shown by the hero track and the walk rail.
export function Frame() {
  const entered = useApp((s) => s.entered);
  const section = useApp((s) => s.section);
  return (
    <>
      <div className={cn('frame', entered && section !== CLOSING && 'is-in')} aria-hidden="true">
        <span className="frame-corner tl" />
        <span className="frame-corner tr" />
        <span className="frame-corner bl" />
        <span className="frame-corner br" />
      </div>
      <div className="progress-line" aria-hidden="true"><i /></div>
    </>
  );
}
