// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Pager } from '@/lib/scroll/Pager';
import { RANGE, easeInOutSine, pageDuration } from '@/lib/scroll/sections';

// jsdom has no ResizeObserver or matchMedia; Lenis uses both on construction.
globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} } as unknown as typeof ResizeObserver;
window.matchMedia ??= ((query: string) => ({
  matches: false, media: query, onchange: null,
  addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false,
})) as typeof window.matchMedia;

const TOPS = [...Array.from({ length: 14 }, (_, i) => i * 1000), 13720];

// Lenis is replaced by a spy that never completes, like an animation superseded by a newer scrollTo.
function setup() {
  const pager = new Pager({ paging: true, onSection: () => {} });
  const calls: number[] = [];
  const options: { duration?: number; easing?: (t: number) => number }[] = [];
  vi.spyOn(pager.lenis, 'scrollTo').mockImplementation((target, opts) => {
    if (typeof target === 'number') calls.push(target);
    options.push(opts ?? {});
  });
  Object.assign(pager as unknown as { tops: number[]; vh: number }, { tops: TOPS, vh: 800 });
  return { pager, calls, options };
}

let current: Pager | null = null;
afterEach(() => {
  current?.destroy();
  current = null;
});

describe('Pager', () => {
  it('releases the page lock when a scroll to an element supersedes a page move', () => {
    const { pager, calls } = setup();
    current = pager;
    pager.goTo(2);
    pager.scrollToElement(document.body);
    pager.goTo(3);
    expect(calls).toEqual([2000, 3000]);
  });

  it('pages with the keyboard instead of scrolling part-way into a section', () => {
    const { pager, calls } = setup();
    current = pager;
    pager.start();
    dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown', cancelable: true }));
    expect(calls).toEqual([1000]);
  });

  it('runs the FAQ scroll from the hero at the jump pace, so every spin stays readable', () => {
    const { pager, options } = setup();
    current = pager;
    pager.scrollToElement(document.body);
    expect(options[0].duration).toBeGreaterThanOrEqual(pageDuration(0, RANGE));
    expect(options[0].easing).toBe(easeInOutSine);
  });

  it('leaves keys alone while typing in a field', () => {
    const { pager, calls } = setup();
    current = pager;
    pager.start();
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    expect(calls).toEqual([]);
    input.remove();
  });
});
