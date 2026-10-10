import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PRODUCTS, productUrl } from './products';
import { store } from './store';
import { createProgress } from './progress';
import { readDebug } from './debug';
import { withTimeout } from './timeout';
import { isTap, type Point } from './tap';
import { Pager } from './scroll/Pager';
import { CLOSING, RANGE, SECTIONS, productForSection, sectionForProduct, type SectionId } from './scroll/sections';
import { setPager } from './scroll/instance';
import { scrollToTime } from './scroll/math';
import { buildMasterTimeline } from './scroll/timeline';
import { buildKeyframes } from './stage/keyframes';
import { DEFAULT_VALUES } from './stage/values';
import type { Stage, Quality } from './stage/Stage';

const INK = '#111111';
const LOAD_TIMEOUT = 8000;

function hasWebGL(): boolean {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
}

// next/font exposes the hashed Poppins family on <html>; the canvas labels need it loaded first.
async function labelFont(): Promise<string> {
  const family = getComputedStyle(document.documentElement).getPropertyValue('--font-poppins').trim() || 'Poppins, sans-serif';
  await Promise.all(['400', '500', '600'].map((w) => document.fonts.load(`${w} 64px ${family}`))).catch(() => undefined);
  return family;
}

export async function boot(canvas: HTMLCanvasElement): Promise<() => void> {
  gsap.registerPlugin(ScrollTrigger);
  const cleanups: (() => void)[] = [];
  const debug = readDebug();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobileQuery = matchMedia('(max-width: 760px)');
  const quality: Quality = mobileQuery.matches || (navigator.hardwareConcurrency ?? 8) <= 4 ? 'low' : 'high';

  if (debug.product !== null) store.set({ product: debug.product, productSource: 'ui' });

  // Loading
  const progress = createProgress({ models: 3, fonts: 1 }, (v) => {
    store.set({ loaded: v });
    if (v >= 1) store.set({ ready: true });
  });
  void document.fonts.ready.then(() => progress.update('fonts', 1));

  // One deadline for the whole 3D path: a stalled font, chunk or label build drops to the static path
  // instead of hanging, and a stage that finishes after the deadline is thrown away.
  let stage: Stage | null = null;
  if (hasWebGL()) {
    let s: Stage | null = null;
    let late = false;
    const build = async () => {
      const font = await labelFont();
      const { Stage } = await import('./stage/Stage');
      if (late) throw new Error('timeout');
      s = new Stage({ canvas, quality, labelFont: font, background: INK, reduced, onProgress: (f) => progress.update('models', f) });
      await s.load();
      if (late) {
        s.dispose();
        throw new Error('timeout');
      }
      return s;
    };
    try {
      stage = await withTimeout(build(), LOAD_TIMEOUT);
      stage.setProduct(store.get().product);
    } catch {
      late = true;
      (s as Stage | null)?.dispose();
      store.set({ webgl: false });
    }
  } else {
    store.set({ webgl: false });
  }
  progress.update('models', 1);
  progress.update('fonts', 1);

  // Scroll
  const pager = new Pager({
    paging: !reduced,
    onSection: (i) => {
      store.set({ section: i });
      // Without the stage, the section alone decides which product the walk shows.
      const p = productForSection(i);
      if (!stage && p !== null) store.set({ product: p, productSource: 'stage' });
    },
  });
  setPager(pager);
  pager.stop();
  pager.measure();
  const values = stage?.values ?? { ...DEFAULT_VALUES };
  let master = buildMasterTimeline(values, buildKeyframes(mobileQuery.matches));
  const root = document.documentElement.style;
  const trigger = ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      master.time(scrollToTime(self.scroll(), pager.sectionTops));
      root.setProperty('--progress', self.progress.toFixed(4));
    },
  });
  pager.lenis.on('scroll', ScrollTrigger.update);

  const onResize = () => {
    pager.measure();
    stage?.resize();
    ScrollTrigger.refresh();
    master.time(scrollToTime(scrollY, pager.sectionTops));
  };
  const onBreakpoint = () => {
    master.kill();
    master = buildMasterTimeline(values, buildKeyframes(mobileQuery.matches));
    onResize();
  };
  addEventListener('resize', onResize);
  mobileQuery.addEventListener('change', onBreakpoint);
  cleanups.push(() => {
    removeEventListener('resize', onResize);
    mobileQuery.removeEventListener('change', onBreakpoint);
  });

  // Frame loop: Lenis first so the timeline reads this frame's scroll. Once the closing sections
  // are well in view the canvas fades out and stops rendering.
  const tick = (time: number, deltaMs: number) => {
    pager.raf(time * 1000);
    const closingTop = pager.sectionTops[CLOSING];
    const off = closingTop !== undefined && pager.lenis.scroll > closingTop + innerHeight * 0.5;
    canvas.classList.toggle('is-off', off);
    if (!stage || off) return;
    stage.render(Math.min(deltaMs, 100) / 1000);
    const p = stage.product;
    if (p !== store.get().product) store.set({ product: p, productSource: 'stage' });
  };
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  // Hero drag and center-vial click; range hover and click
  if (stage) {
    const st = stage;
    let dragging = false;
    let lastX = 0;
    let moved = 0;
    const canDrag = () => store.get().entered && store.get().section === 0;
    const inRange = () => store.get().entered && store.get().section === RANGE;
    // Range row: open a product on release, and only for a tap, so a swipe that starts on a vial scrolls.
    let rangeDown: Point | null = null;
    const down = (e: PointerEvent) => {
      if (inRange()) {
        rangeDown = { x: e.clientX, y: e.clientY };
        return;
      }
      if (!canDrag()) return;
      dragging = true;
      lastX = e.clientX;
      moved = 0;
      canvas.setPointerCapture(e.pointerId);
      document.body.classList.add('is-grabbing');
    };
    const move = (e: PointerEvent) => {
      st.pointer.x = e.clientX / innerWidth - 0.5;
      st.pointer.y = e.clientY / innerHeight - 0.5;
      if (dragging) {
        const dx = e.clientX - lastX;
        lastX = e.clientX;
        moved += Math.abs(dx);
        st.drag(dx);
        return;
      }
      if (inRange()) {
        const hit = st.hitProduct(e.clientX, e.clientY);
        st.setHover(hit);
        store.set({ hover: hit });
        canvas.style.cursor = hit === null ? '' : 'pointer';
        return;
      }
      canvas.style.cursor = canDrag() ? (st.hitCenter(e.clientX, e.clientY) ? 'pointer' : 'grab') : '';
    };
    const up = (e: PointerEvent) => {
      if (rangeDown) {
        const tap = e.type === 'pointerup' && inRange() && isTap(rangeDown, { x: e.clientX, y: e.clientY });
        rangeDown = null;
        const hit = tap ? st.hitProduct(e.clientX, e.clientY) : null;
        if (hit !== null) window.open(productUrl(PRODUCTS[hit]), '_blank', 'noreferrer');
        return;
      }
      if (!dragging) return;
      dragging = false;
      document.body.classList.remove('is-grabbing');
      if (moved < 6 && e.type === 'pointerup' && st.hitCenter(e.clientX, e.clientY)) {
        pager.goTo(sectionForProduct(st.product));
        return;
      }
      st.release();
    };
    // Two-finger sideways swipe on a trackpad (or shift+wheel) drags the carousel, then snaps once it goes quiet.
    let wheelIdle: ReturnType<typeof setTimeout> | undefined;
    const wheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      if (e.cancelable) e.preventDefault();
      if (!canDrag() || dragging) return;
      st.drag(-e.deltaX * (e.deltaMode === 1 ? 16 : 1));
      clearTimeout(wheelIdle);
      wheelIdle = setTimeout(() => st.release(false), 140);
    };
    canvas.addEventListener('pointerdown', down);
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
    addEventListener('pointercancel', up);
    addEventListener('wheel', wheel, { passive: false });
    cleanups.push(() => {
      clearTimeout(wheelIdle);
      removeEventListener('wheel', wheel);
      canvas.removeEventListener('pointerdown', down);
      removeEventListener('pointermove', move);
      removeEventListener('pointerup', up);
      removeEventListener('pointercancel', up);
    });
  }

  // Store reactions
  let prev = store.get();
  const enter = () => {
    pager.start();
    if (stage) {
      if (debug.skipIntro || reduced) stage.intro = 1;
      else gsap.to(stage, { intro: 1, duration: 2.4, ease: 'power3.out' });
    }
    if (debug.section !== null) pager.jump(debug.section);
    else {
      // Deep links such as #p05 open on that section.
      const fromHash = SECTIONS.indexOf(location.hash.slice(1) as SectionId);
      if (fromHash > 0) pager.jump(fromHash);
    }
  };
  // prev is advanced before any side effect: reactions below can set the store again,
  // and the nested callback must compare against this state, not the stale one.
  const unsubscribe = store.subscribe(() => {
    const s = store.get();
    const p = prev;
    prev = s;
    if (s.product !== p.product && s.productSource === 'ui') stage?.setProduct(s.product);
    if (s.section !== p.section && p.section === RANGE) {
      stage?.setHover(null);
      if (s.hover !== null) store.set({ hover: null });
    }
    if (s.entered && !p.entered) enter();
    if (s.ready && debug.skipIntro && !s.entered) store.set({ entered: true });
  });
  // A remount (dev strict mode, HMR) can find the store already entered.
  const initial = store.get();
  if (initial.entered) enter();
  else if (initial.ready && debug.skipIntro) store.set({ entered: true });

  return () => {
    unsubscribe();
    gsap.ticker.remove(tick);
    trigger.kill();
    master.kill();
    cleanups.forEach((fn) => fn());
    pager.destroy();
    setPager(null);
    if (stage) gsap.killTweensOf(stage);
    document.body.classList.remove('is-grabbing');
    canvas.classList.remove('is-off');
    stage?.dispose();
  };
}
