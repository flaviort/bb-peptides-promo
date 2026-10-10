'use client';

import type { ReactNode } from 'react';
import { useApp } from '@/lib/store';

// The page content stays out of the tab order and the accessibility tree until the gate is passed.
export function MainShell({ children }: { children: ReactNode }) {
  const entered = useApp((s) => s.entered);
  return (
    <main inert={!entered} className="pointer-events-none relative z-[2]">
      {children}
    </main>
  );
}
