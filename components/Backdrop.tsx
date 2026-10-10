'use client';

import { useApp } from '@/lib/store';
import { cn } from '@/lib/cn';
import { GradientWaves } from './GradientWaves';

export function Backdrop() {
  const section = useApp((s) => s.section);
  const glow = section >= 1 && section <= 6;
  // Waves and haze show only on the hero.
  const offHero = section >= 1;
  return (
    <div className="backdrop" aria-hidden="true">
      <div className="backdrop-base" />
      <GradientWaves visible={!offHero} />
      <div className={cn('backdrop-glow', glow && 'is-on')} />
      <div className={cn('backdrop-range', section === 7 && 'is-on')} />
      <div className={cn('hero-haze', offHero && 'is-hidden')} />
    </div>
  );
}
