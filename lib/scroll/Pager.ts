import Lenis from 'lenis';
import { planPage, resnap, sectionAt, zoneFor } from './math';
import { RANGE, easeInOutSine, pageDuration, pageEase } from './sections';


export interface PagerOptions {
  paging: boolean;
  onSection: (index: number) => void;
}

export class Pager {
  readonly lenis: Lenis;
  private tops: number[] = [];
  private vh = 0;
  private locked = false;
  private lastEventAt = 0;
  private unlockedAt = 0;
  private swipe = 0;
  private current = 0;
  private queued: number | null = null;

  constructor(private readonly opts: PagerOptions) {
    this.lenis = new Lenis({
      autoRaf: false,
      syncTouch: opts.paging,
      smoothWheel: opts.paging,
      virtualScroll: (d) => this.intercept(d.deltaY, d.event),
    });
    this.lenis.on('scroll', this.onScroll);
    addEventListener('touchend', this.resetSwipe, { passive: true });
    addEventListener('keydown', this.onKey);
  }

  get sectionTops(): readonly number[] {
    return this.tops;
  }

  measure() {
    const oldTops = this.tops;
    this.tops = Array.from(document.querySelectorAll<HTMLElement>('[data-section]'), (el) => el.offsetTop);
    this.vh = innerHeight;
    if (oldTops.length !== this.tops.length || oldTops.every((t, i) => t === this.tops[i])) return;
    // A resize moved every section top: restart a page move toward its new target, or re-snap the
    // resting scroll, so the walk never parks between two products.
    if (this.locked) {
      this.animateTo(this.current, this.tops[this.current]);
      return;
    }
    const to = resnap(this.lenis.scroll, oldTops, this.tops);
    if (Math.abs(to - this.lenis.scroll) > 1) this.lenis.scrollTo(to, { immediate: true, force: true });
  }

  raf(ms: number) {
    this.lenis.raf(ms);
  }

  start() {
    this.lenis.start();
  }

  stop() {
    this.lenis.stop();
  }

  goTo(index: number) {
    if (!this.tops.length) return;
    if (this.locked) {
      this.queued = index;
      return;
    }
    if (!this.opts.paging) {
      this.lenis.scrollTo(this.tops[index], { duration: 1.2 });
      return;
    }
    this.animateTo(index, this.tops[index]);
  }

  jump(index: number) {
    this.lenis.scrollTo(this.tops[index] ?? 0, { immediate: true, force: true });
    this.current = index;
    this.opts.onSection(index);
  }

  destroy() {
    removeEventListener('touchend', this.resetSwipe);
    removeEventListener('keydown', this.onKey);
    this.lenis.destroy();
  }

  // Returning false makes Lenis skip the event entirely, including its preventDefault,
  // so every swallowed event is cancelled here or the browser scrolls natively.
  private intercept(deltaY: number, event: Event): boolean {
    // ctrl+wheel is browser zoom or trackpad pinch: leave it to the browser, as Lenis does.
    if (event instanceof WheelEvent && event.ctrlKey) return true;
    // Sideways trackpad swipes belong to the hero carousel (lib/boot.ts), never to paging.
    if (event instanceof WheelEvent && Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
      if (event.cancelable) event.preventDefault();
      return false;
    }
    if (!this.opts.paging || !this.tops.length || this.lenis.isStopped) return true;
    const dir = deltaY > 0 ? 1 : deltaY < 0 ? -1 : 0;
    if (dir === 0) return true;
    if (zoneFor(this.lenis.scroll, this.vh, this.tops, dir) === 'free') return true;
    if (event.cancelable) event.preventDefault();
    const now = performance.now();
    const gap = now - this.lastEventAt;
    this.lastEventAt = now;
    if (this.locked) return false;
    if (event.type.startsWith('touch')) {
      this.swipe += deltaY;
      if (Math.abs(this.swipe) < 24) return false;
      this.swipe = 0;
    } else if (gap < 180 && now - this.unlockedAt < 700) {
      return false; // trailing trackpad inertia from the previous page
    }
    const plan = planPage(this.lenis.scroll, this.vh, this.tops, dir);
    if (!plan) return false;
    this.animateTo(plan.to, plan.scroll);
    return false;
  }

  private animateTo(to: number, scroll: number) {
    const from = this.current;
    this.locked = true;
    this.current = to;
    this.opts.onSection(to);
    this.lenis.scrollTo(scroll, {
      duration: pageDuration(from, to),
      easing: pageEase(from, to),
      lock: true,
      force: true,
      onComplete: () => {
        this.locked = false;
        this.unlockedAt = performance.now();
        const next = this.queued;
        this.queued = null;
        if (next !== null && next !== this.current) this.goTo(next);
      },
    });
  }

  scrollToElement(el: HTMLElement) {
    // This scroll replaces any page move in flight, whose onComplete then never runs: release its lock
    // here, or paging and every queued jump stay wedged for the rest of the visit.
    this.locked = false;
    this.queued = null;
    // From inside the paged zone the scroll passes every remaining product spin, so it keeps the jump pace.
    const paged = this.current < RANGE;
    this.lenis.scrollTo(el, {
      offset: -96,
      duration: paged ? Math.max(1.6, pageDuration(this.current, RANGE)) : 1.6,
      easing: easeInOutSine,
      force: true,
      onComplete: () => {
        this.unlockedAt = performance.now();
        this.onScroll();
      },
    });
  }

  // Page, Space, arrow, Home and End keys page like the wheel does instead of scrolling part-way into a section.
  private onKey = (e: KeyboardEvent) => {
    if (!this.opts.paging || !this.tops.length || this.lenis.isStopped) return;
    if (e.defaultPrevented || e.altKey || e.metaKey || e.ctrlKey) return;
    const target = e.target instanceof Element ? e.target : null;
    if (target?.closest('input, textarea, select, [contenteditable], [role="dialog"]')) return;
    if (e.key === ' ' && target?.closest('a, button')) return;
    const steps: Record<string, 1 | -1> = { PageDown: 1, ArrowDown: 1, PageUp: -1, ArrowUp: -1, ' ': e.shiftKey ? -1 : 1 };
    const dir: 1 | -1 | undefined = e.key === 'Home' ? -1 : e.key === 'End' ? 1 : steps[e.key];
    if (!dir) return;
    if (zoneFor(this.lenis.scroll, this.vh, this.tops, dir) === 'free') return;
    e.preventDefault();
    if (this.locked) return;
    if (e.key === 'Home' || e.key === 'End') {
      const to = e.key === 'Home' ? 0 : RANGE;
      if (to !== this.current) this.animateTo(to, this.tops[to]);
      return;
    }
    const plan = planPage(this.lenis.scroll, this.vh, this.tops, dir);
    if (plan) this.animateTo(plan.to, plan.scroll);
  };

  private onScroll = () => {
    if (this.locked || !this.tops.length) return;
    const s = this.lenis.scroll;
    const idx = sectionAt(s, this.tops, this.vh);
    if (idx !== this.current) {
      this.current = idx;
      this.opts.onSection(idx);
    }
  };

  private resetSwipe = () => {
    this.swipe = 0;
  };
}
