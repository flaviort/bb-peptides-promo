import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FLAVORS, type Flavor } from './flavors';
import { store } from './store';
import { KEYS, readFlag } from './persist';
import { createProgress } from './progress';
import { readDebug } from './debug';
import { Pager } from './scroll/Pager';
import { SECTIONS, type SectionId } from './scroll/sections';
import { setPager } from './scroll/instance';
import { scrollToTime } from './scroll/math';
import { buildMasterTimeline } from './scroll/timeline';
import { buildKeyframes } from './stage/keyframes';
import { DEFAULT_VALUES } from './stage/values';
import type { Stage, Quality } from './stage/Stage';

const CREAM = '#F6EDDC';

function hasWebGL(): boolean {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
}

function applyFlavorVars(f: Flavor) {
  const root = document.documentElement.style;
  root.setProperty('--p', f.colors.p);
  root.setProperty('--s', f.colors.s);
  root.setProperty('--d', f.colors.d);
}

export async function boot(canvas: HTMLCanvasElement): Promise<() => void> {
  gsap.registerPlugin(ScrollTrigger);
  const cleanups: (() => void)[] = [];
  const debug = readDebug();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobileQuery = matchMedia('(max-width: 760px)');
  const quality: Quality = mobileQuery.matches || (navigator.hardwareConcurrency ?? 8) <= 4 ? 'low' : 'high';

  // Preferences
  store.set({ ageOk: readFlag(KEYS.age) === true || debug.skipGate });
  if (debug.flavor !== null) store.set({ flavor: debug.flavor, flavorSource: 'ui' });
  applyFlavorVars(FLAVORS[store.get().flavor]);

  // Loading
  const progress = createProgress({ textures: 3, fonts: 1 }, (v) => {
    store.set({ loaded: v });
    if (v >= 1) store.set({ ready: true });
  });
  void document.fonts.ready.then(() => progress.update('fonts', 1));

  // Safety net: a stalled fetch or chunk must not strand the visitor on the preloader.
  const safety = setTimeout(() => {
    progress.update('textures', 1);
  }, 8000);
  cleanups.push(() => clearTimeout(safety));

  let stage: Stage | null = null;
  if (hasWebGL()) {
    let s: Stage | null = null;
    try {
      const { Stage } = await import('./stage/Stage');
      s = new Stage({
        canvas,
        quality,
        labels: FLAVORS.map((f) => (quality === 'high' ? f.label.hi : f.label.lo)),
        background: CREAM,
        onProgress: (f) => progress.update('textures', f),
      });
      await s.load();
      stage = s;
      stage.setFlavor(store.get().flavor);
    } catch {
      s?.dispose();
      store.set({ webgl: false });
    }
  } else {
    store.set({ webgl: false });
  }
  progress.update('textures', 1);

  // Scroll
  const pager = new Pager({ paging: !reduced, onSection: (i) => store.set({ section: i }) });
  setPager(pager);
  pager.stop();
  pager.measure();
  const values = stage?.values ?? { ...DEFAULT_VALUES };
  let master = buildMasterTimeline(values, buildKeyframes(mobileQuery.matches));
  const trigger = ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => master.time(scrollToTime(self.scroll(), pager.sectionTops)),
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

  // Frame loop: Lenis first so the timeline reads this frame's scroll.
  const tick = (time: number, deltaMs: number) => {
    pager.raf(time * 1000);
    if (!stage) return;
    stage.render(Math.min(deltaMs, 100) / 1000);
    const f = stage.flavor;
    if (f !== store.get().flavor) store.set({ flavor: f, flavorSource: 'stage' });
  };
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  // Hero drag and center-can click
  if (stage) {
    const st = stage;
    let dragging = false;
    let lastX = 0;
    let moved = 0;
    const canDrag = () => store.get().entered && store.get().section === 0;
    const down = (e: PointerEvent) => {
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
      if (!dragging) {
        canvas.style.cursor = canDrag() ? (st.hitCenter(e.clientX, e.clientY) ? 'pointer' : 'grab') : '';
        return;
      }
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      moved += Math.abs(dx);
      st.drag(dx);
    };
    const up = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      document.body.classList.remove('is-grabbing');
      if (moved < 6 && e.type === 'pointerup' && st.hitCenter(e.clientX, e.clientY)) {
        pager.goTo(1);
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
      if (debug.skipGate) stage.intro = 1;
      else gsap.to(stage, { intro: 1, duration: 2.4, ease: 'power3.out' });
    }
    if (debug.section !== null) pager.jump(debug.section);
    else {
      // Deep links such as #benefit-2 (the claim rail's hrefs) open on that section.
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
    if (s.flavor !== p.flavor) {
      applyFlavorVars(FLAVORS[s.flavor]);
      if (s.flavorSource === 'ui') stage?.setFlavor(s.flavor);
      else stage?.setTint(s.flavor);
    }
    if (s.entered && !p.entered) enter();
    if (s.ready && debug.skipGate && !s.entered) store.set({ entered: true });
  });
  // A remount (dev strict mode, HMR) can find the store already entered.
  const initial = store.get();
  if (initial.entered) enter();
  else if (initial.ready && debug.skipGate) store.set({ entered: true });

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
    stage?.dispose();
  };
}
