import type { CSSProperties } from 'react';

const NBSP = ' ';

export function RollLabel({ text }: { text: string }) {
  return (
    <span className="roll" aria-hidden="true">
      {[...text].map((ch, i) => {
        const c = ch === ' ' ? NBSP : ch;
        return (
          <span key={i} className="ch" data-ch={c} style={{ '--i': i } as CSSProperties}>
            {c}
          </span>
        );
      })}
    </span>
  );
}
