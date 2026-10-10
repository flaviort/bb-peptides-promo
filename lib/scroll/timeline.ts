import gsap from 'gsap';
import type { SceneValues } from '@/lib/stage/values';

// Section i occupies timeline time [i, i + 1]. Easing is linear because Lenis already eases the scroll.
export function buildMasterTimeline(target: SceneValues, frames: SceneValues[]): gsap.core.Timeline {
  // A paused timeline renders nothing until its playhead moves, so seed the first frame by hand.
  Object.assign(target, frames[0]);
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none', duration: 1 } });
  tl.set(target, { ...frames[0] }, 0);
  for (let i = 1; i < frames.length; i++) tl.to(target, { ...frames[i] }, i - 1);
  return tl;
}
