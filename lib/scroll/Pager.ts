import Lenis from 'lenis';
import { planPage, sectionAt, zoneFor } from './math';
import { pageDuration } from './sections';

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

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
  }

  get sectionTops(): readonly number[] {
    return this.tops;
  }

  measure() {
    this.tops = Array.from(document.querySelectorAll<HTMLElement>('[data-section]'), (el) => el.offsetTop);
    this.vh = innerHeight;
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
    this.locked = true;
    this.current = to;
    this.opts.onSection(to);
    this.lenis.scrollTo(scroll, {
      duration: pageDuration(to),
      easing: easeOutCubic,
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
