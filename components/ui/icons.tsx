// One stroke icon set at 1.6px, drawn for this page.
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, 'aria-hidden': true } as const;

export const IconArrow = () => (
  <svg {...base} viewBox="0 0 16 16"><path d="M2 8h11M9 4l4 4-4 4" /></svg>
);

export const IconChevron = ({ dir }: { dir: 1 | -1 }) => (
  <svg {...base} viewBox="0 0 18 18"><path d={dir > 0 ? 'M7 3l6 6-6 6' : 'M11 3 5 9l6 6'} /></svg>
);

export const IconPlus = () => (
  <svg {...base} viewBox="0 0 20 20"><path d="M10 3v14M3 10h14" /></svg>
);
