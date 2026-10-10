import { wrapIndex } from '@/lib/products';
import type { SceneValues } from './values';

export interface Pose { x: number; y: number; z: number; rx: number; ry: number; rz: number }

// Center-to-center distance in the range row. A vial is about 1.3 units wide (VIAL_SCALE).
export const ROW_GAP = 1.5;

export function wrapOffset(slot: number, pos: number, count: number): number {
  const half = count / 2;
  let o = (slot - pos) % count;
  if (o < -half) o += count;
  else if (o >= half) o -= count;
  return o;
}

// Hero ring: a gentle rising wave, sides pushed back. Every angle is a smooth function of the
// offset, so a vial rolls, leans and turns its label as it travels through the slots.
export function carouselPose(o: number, v: Pick<SceneValues, 'spacing' | 'wave' | 'tilt' | 'depth'>): Pose {
  const a = Math.abs(o);
  return {
    x: o * v.spacing,
    y: Math.sin(o * 0.45) * v.wave * 2.2,
    z: a === 0 ? 0 : -Math.pow(a, 1.3) * v.depth,
    rx: 0.18 + Math.min(a, 3) * 0.1,
    ry: o * 0.42,
    rz: v.tilt * Math.cos(o * 1.25) - o * 0.05,
  };
}

// Range lineup: vials shoulder to shoulder on a line that rises and recedes to the right.
// spread opens the gaps as the row lifts away into the closing sections.
export function rowPose(o: number, spread = 1): Pose {
  return { x: o * ROW_GAP * spread, y: o * 0.17, z: -o * 0.28, rx: o * 0.12, ry: -0.2 + o * 0.03, rz: -0.05 };
}

export function focusPose(v: SceneValues): Pose {
  return { x: v.focusX, y: v.focusY, z: v.focusZ, rx: v.focusRotX, ry: v.focusRotY, rz: v.focusRotZ };
}

export function blendPose(a: Pose, b: Pose, t: number): Pose {
  const l = (x: number, y: number) => x + (y - x) * t;
  return { x: l(a.x, b.x), y: l(a.y, b.y), z: l(a.z, b.z), rx: l(a.rx, b.rx), ry: l(a.ry, b.ry), rz: l(a.rz, b.rz) };
}

export function nearestSlotForProduct(from: number, product: number, count: number): number {
  const base = Math.round(from);
  let best = base;
  let bestD = Infinity;
  for (let s = base - count; s <= base + count; s++) {
    if (wrapIndex(s, count) !== product) continue;
    const d = Math.abs(s - from);
    if (d < bestD) { bestD = d; best = s; }
  }
  return best;
}

export function productAtPos(pos: number, count: number): number {
  return wrapIndex(Math.round(pos), count);
}

// How far the camera may slide sideways over the range row before an end vial leaves the frame.
// Zero when the whole row already fits, as it does on desktop.
export function rangePanLimit(camZ: number, fovDeg: number, aspect: number, count: number): number {
  const halfRow = ((count - 1) / 2) * ROW_GAP + 0.9; // half a vial plus a little air past each end
  const halfView = camZ * Math.tan((fovDeg * Math.PI) / 360) * aspect;
  return Math.max(0, halfRow - halfView);
}

// The range row's magnifier: 1 for the vial under the focus point (the cursor on desktop, the middle
// of the view on phones), easing to 0 about three vials away, so the row swells like a wave.
export const MAGNIFY_SCALE = 0.3;
export function rowMagnify(dx: number): number {
  return Math.exp(-((dx / 1.9) ** 2));
}

// Half the walk vial's on-screen height in world units: its tilted body (VIAL_HEIGHT 1.86, radius 0.5,
// leaned 12 degrees) at VIAL_SCALE 1.3.
export const WALK_VIAL_HALF_HEIGHT = 1.32;

// The focusY that puts the walk vial's base basePx from the top of a viewHeight-px screen. Phones place
// the vial from the panel below it (lib/boot.ts), since the panel is sized in px and the scene is not.
export function focusYForBase(basePx: number, viewHeight: number, camY: number, camZ: number, fovDeg: number): number {
  const halfView = camZ * Math.tan((fovDeg * Math.PI) / 360);
  return camY + (1 - (2 * basePx) / viewHeight) * halfView + WALK_VIAL_HALF_HEIGHT;
}
