import { LAST, RANGE } from './sections';

const EPS = 2;

export function scrollToTime(scroll: number, tops: readonly number[]): number {
  if (scroll <= tops[0]) return 0;
  for (let i = 0; i < tops.length - 1; i++) {
    if (scroll < tops[i + 1]) return i + (scroll - tops[i]) / (tops[i + 1] - tops[i]);
  }
  return tops.length - 1;
}

export function nearestSection(scroll: number, tops: readonly number[]): number {
  let best = 0;
  for (let i = 1; i < tops.length; i++) {
    if (Math.abs(tops[i] - scroll) < Math.abs(tops[best] - scroll)) best = i;
  }
  return best;
}

export function sectionAt(scroll: number, tops: readonly number[], vh: number): number {
  const probe = scroll + vh * 0.5;
  let idx = 0;
  for (let i = 0; i < tops.length; i++) if (tops[i] <= probe) idx = i;
  return idx;
}

// From the range row to the end of the page (FAQ, newsletter, footer) the page scrolls natively,
// with no snapping: the row eases out of frame as you read on. Everything above pages.
export function zoneFor(scroll: number, _vh: number, tops: readonly number[], dir: 1 | -1): 'paged' | 'free' {
  const freeTop = tops[RANGE];
  if (scroll < freeTop - EPS) return 'paged';
  if (dir < 0 && scroll <= freeTop + EPS) return 'paged';
  return 'free';
}

export interface PagePlan {
  to: number;
  scroll: number;
}

// Returns null when there is nowhere to go: up from the hero, or down once the free stretch
// begins (the page simply ends after the footer).
export function planPage(scroll: number, _vh: number, tops: readonly number[], dir: 1 | -1): PagePlan | null {
  const inFree = scroll >= tops[RANGE] - EPS;
  const current = inFree ? RANGE : nearestSection(scroll, tops);
  if (dir < 0 && current === 0) return null;
  if (dir > 0 && inFree) return null;
  const to = Math.min(LAST, Math.max(0, current + dir));
  return { to, scroll: tops[to] };
}

// Where to scroll after a resize moved every section top. In the paged zone the page snaps to the
// nearest section, so the walk never parks between products; further down it keeps its relative spot.
export function resnap(scroll: number, oldTops: readonly number[], newTops: readonly number[]): number {
  const last = oldTops.length - 1;
  if (scroll >= oldTops[last]) return newTops[last] + (scroll - oldTops[last]);
  const t = scrollToTime(scroll, oldTops);
  if (t < RANGE) return newTops[Math.round(t)];
  const i = Math.floor(t);
  return newTops[i] + (t - i) * (newTops[i + 1] - newTops[i]);
}
