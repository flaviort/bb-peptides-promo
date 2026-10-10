import { wrapIndex } from '@/lib/flavors';
import type { SceneValues } from './values';

export interface CanPose { x: number; y: number; z: number; rx: number; ry: number; rz: number }

export function wrapOffset(slot: number, pos: number, count: number): number {
  const half = count / 2;
  let o = (slot - pos) % count;
  if (o < -half) o += count;
  else if (o >= half) o -= count;
  return o;
}

// Hero ring: a gentle rising wave, sides pushed back. Every angle is a smooth function of the
// offset, so a can rolls, leans and turns its label as it travels through the slots.
export function carouselPose(o: number, v: Pick<SceneValues, 'spacing' | 'wave' | 'tilt' | 'depth'>): CanPose {
  const a = Math.abs(o);
  return {
    x: o * v.spacing,
    y: Math.sin(o * 0.45) * v.wave * 2.2,
    z: a === 0 ? 0 : -Math.pow(a, 1.3) * v.depth,
    // Bottoms swing toward the camera more the further out a can sits.
    rx: 0.18 + Math.min(a, 3) * 0.1,
    ry: o * 0.42,
    // Center leans left, neighbours lean the other way, the far ones settle back.
    rz: v.tilt * Math.cos(o * 1.25) - o * 0.05,
  };
}

// Range lineup, after Ciao: cans shoulder to shoulder on a line that rises and recedes to the
// right. Near cans on the left show their bases, far ones on the right their lids.
// spread opens the gaps as the row lifts away into the FAQ.
export function rowPose(o: number, spread = 1): CanPose {
  return { x: o * 1.1 * spread, y: o * 0.17, z: -o * 0.28, rx: o * 0.18, ry: -0.2 + o * 0.03, rz: -0.05 };
}

export function focusPose(v: SceneValues): CanPose {
  return { x: v.focusX, y: v.focusY, z: v.focusZ, rx: v.focusRotX, ry: v.focusRotY, rz: v.focusRotZ };
}

export function blendPose(a: CanPose, b: CanPose, t: number): CanPose {
  const l = (x: number, y: number) => x + (y - x) * t;
  return { x: l(a.x, b.x), y: l(a.y, b.y), z: l(a.z, b.z), rx: l(a.rx, b.rx), ry: l(a.ry, b.ry), rz: l(a.rz, b.rz) };
}

export function nearestSlotForFlavor(from: number, flavor: number, flavors: number): number {
  const base = Math.round(from);
  let best = base;
  let bestD = Infinity;
  for (let s = base - flavors; s <= base + flavors; s++) {
    if (wrapIndex(s, flavors) !== flavor) continue;
    const d = Math.abs(s - from);
    if (d < bestD) { bestD = d; best = s; }
  }
  return best;
}

export function flavorAtPos(pos: number, flavors: number): number {
  return wrapIndex(Math.round(pos), flavors);
}
