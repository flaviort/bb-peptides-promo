import type { BenefitIcon } from '@/lib/content';

const base = {
  width: 26,
  height: 26,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

// Two overlapping drops of different sizes: THC and CBD in one can.
export const IconDose = () => (
  <svg {...base}><path d="M9 3.5s-4.5 5-4.5 8.5a4.5 4.5 0 0 0 9 0C13.5 8.5 9 3.5 9 3.5Z" /><path d="M16.5 10s-3 3.2-3 5.5a3 3 0 0 0 6 0c0-2.3-3-5.5-3-5.5Z" /></svg>
);
export const IconJuice = () => (
  <svg {...base}><circle cx="12" cy="13" r="7" /><path d="M12 6v14M5 13h14M7 8l10 10M17 8 7 18" /><path d="M12 6c0-2 1-3 3-3.5" /></svg>
);
export const IconLeaf = () => (
  <svg {...base}><path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14Z" /><path d="m5 19 8-8" /></svg>
);
export const IconGlass = () => (
  <svg {...base}><path d="M8 3h8l-1 8a3 3 0 0 1-6 0L8 3Z" /><path d="M12 14v6M9 21h6" /><path d="m4 4 16 16" /></svg>
);

export const BENEFIT_ICONS: Record<BenefitIcon, () => React.JSX.Element> = {
  dose: IconDose,
  juice: IconJuice,
  leaf: IconLeaf,
  glass: IconGlass,
};

// Line arrow with a dotted tail, echoing the label's three-dot motif.
export function IconArrow({ dir }: { dir: 1 | -1 }) {
  return (
    <svg width="28" height="14" viewBox="0 0 28 14" fill="none" aria-hidden="true" style={dir < 0 ? { transform: 'scaleX(-1)' } : undefined}>
      <g fill="currentColor" className="arrow-tail">
        <circle cx="2" cy="7" r="1.4" />
        <circle cx="6.5" cy="7" r="1.4" />
      </g>
      <path d="M11 7h15M20 1.5 26 7l-6 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
