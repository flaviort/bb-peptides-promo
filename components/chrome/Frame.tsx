'use client';

import { PRODUCT_COUNT, pad2 } from '@/lib/products';
import { CLOSING, LAST_PRODUCT } from '@/lib/scroll/sections';
import { useApp } from '@/lib/store';
import { cn } from '@/lib/cn';

// Corner brackets, the 01 / 12 counter and the top progress line (its width is --progress, set in lib/boot.ts).
export function Frame() {
  const entered = useApp((s) => s.entered);
  const section = useApp((s) => s.section);
  const product = useApp((s) => s.product);
  return (
    <>
      <div className={cn('frame', entered && section !== CLOSING && 'is-in')} aria-hidden="true">
        <span className="frame-corner tl" />
        <span className="frame-corner tr" />
        <span className="frame-corner bl" />
        <span className="frame-corner br" />
        <div className={cn('frame-count', section <= LAST_PRODUCT && 'is-on')}>
          <span className="frame-count-now">{pad2(product + 1)}</span>
          <span className="frame-count-rule" />
          <span>{pad2(PRODUCT_COUNT)}</span>
        </div>
      </div>
      <div className="progress-line" aria-hidden="true"><i /></div>
    </>
  );
}
