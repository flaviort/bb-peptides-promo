'use client';

// The top progress line (its width is --progress, set in lib/boot.ts).
// Position within the products is shown by the hero track and the walk rail.
export function Frame() {
  return (
    <div className="progress-line" aria-hidden="true"><i /></div>
  );
}
