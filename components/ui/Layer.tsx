'use client';

import type { ReactNode } from 'react';
import { useApp } from '@/lib/store';
import { cn } from '@/lib/cn';

interface LayerProps {
  indices: number[];
  label?: string;
  back?: boolean;
  className?: string;
  children: (active: boolean, section: number) => ReactNode;
}

export function Layer({ indices, label, back, className, children }: LayerProps) {
  const section = useApp((s) => s.section);
  const entered = useApp((s) => s.entered);
  const active = entered && indices.includes(section);
  return (
    <section
      aria-label={label}
      // A back layer without a label is decorative and stays out of the accessibility tree.
      aria-hidden={(back && !label) || !active}
      inert={!active}
      className={cn('layer', back && 'layer--back', active && 'is-active', className)}
    >
      {children(active, section)}
    </section>
  );
}
