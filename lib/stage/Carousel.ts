import * as THREE from 'three';
import type { ProductModel } from './ProductModel';
import type { SceneValues } from './values';
import {
  blendPose, carouselPose, focusPose, nearestSlotForProduct, productAtPos, rowPose, wrapOffset, type Pose,
} from './layout';
import { TAU, dipScale, facesAway, labelTarget, spinAngle, spinPhase } from './walk';

const LABEL_FRONT = new THREE.Vector3();

/** How directly a vial's label faces the camera: 1 toward it, -1 straight away. */
export function labelToward(group: THREE.Object3D): number {
  return LABEL_FRONT.set(0, 0, 1).applyQuaternion(group.quaternion).z;
}

/** Turns the vial makes on a jump between products, however many it skips. */
export const JUMP_TURNS = 2;

export interface FrameInput { mx: number; my: number }
export interface CarouselOptions { reduced: boolean }

export class Carousel {
  readonly group = new THREE.Group();
  pos = 0;
  target = 0;
  /** Product index hovered in the range row, or null. */
  hover: number | null = null;
  /** A product to product jump in flight (product indices), set by the pager. */
  jump: { from: number; to: number } | null = null;
  private time = 0;
  private center = 0;
  private prevWalk: number | null = null;
  private readonly lift: number[];

  constructor(private readonly models: ProductModel[], private readonly opts: CarouselOptions) {
    models.forEach((m) => this.group.add(m.group));
    this.lift = models.map(() => 0);
  }

  get product(): number {
    return productAtPos(this.target, this.models.length);
  }

  get centerModel(): ProductModel {
    return this.models[this.center];
  }

  dragBy(slots: number) {
    this.target -= slots;
    this.pos = this.target;
  }

  release(lastSlots: number) {
    this.target = Math.round(this.target - lastSlots * 8);
  }

  stepBy(n: number) {
    this.target = Math.round(this.target) + n;
  }

  goToProduct(i: number) {
    this.target = nearestSlotForProduct(this.target, i, this.models.length);
  }

  update(dt: number, v: SceneValues, input: FrameInput) {
    this.time += dt;
    this.pos += (this.target - this.pos) * (1 - Math.exp(-dt * 5));
    const n = this.models.length;
    const reduced = this.opts.reduced;
    // The spin follows the walk, one turn per product. A jump instead makes JUMP_TURNS over the whole
    // move and swaps the label once, straight to the destination, at its first half turn.
    let sw = v.walk;
    let jumpLabel: number | null = null;
    const j = this.jump;
    if (j && j.to !== j.from) {
      const u = Math.min(1, Math.max(0, (v.walk - j.from) / (j.to - j.from)));
      const turned = JUMP_TURNS * u;
      sw = j.from + Math.sign(j.to - j.from) * turned;
      jumpLabel = turned < 0.5 ? j.from : j.to;
    }
    // A frame that crosses a half turn swaps at once, so even a coarse frame lands on the right label.
    // The first frame has shown nothing yet, so it may set any label (a deep link straight into the walk).
    const crossed = this.prevWalk === null || Math.round(this.prevWalk) !== Math.round(sw);
    this.prevWalk = sw;

    let best = Infinity;
    for (let i = 0; i < n; i++) {
      const o = Math.abs(wrapOffset(i, this.pos, n));
      if (o < best) { best = o; this.center = i; }
    }

    for (let i = 0; i < n; i++) {
      const o = wrapOffset(i, this.pos, n);
      // The range row always reads 01 to 12 left to right, centered, whichever vial the hero had in front.
      let pose: Pose = blendPose(carouselPose(o, v), rowPose(i - (n - 1) / 2, v.spread), v.row);
      // Idle wobble keeps each label mostly facing front instead of spinning away. The row holds still.
      if (!reduced) pose.ry += Math.sin(this.time * 0.4 + i * 1.7) * 0.5 * (1 - v.row);
      let scale = 1;
      let spin = 0;
      const w = i === this.center ? v.focus * (1 - Math.min(1, Math.abs(o) * 2)) : 0;
      if (i === this.center) {
        if (w > 0) {
          pose = blendPose(pose, focusPose(v), w);
          if (reduced) {
            scale = 1 + (dipScale(v.walk) - 1) * w;
          } else {
            // The spin is applied after the blend, so it completes even while focus fades in or out.
            // It turns the vial about its own long axis, so it spins in place without moving or tilting.
            spin = spinAngle(sw);
            // A tiny rock while it turns (under 1 degree at mid spin), rotation only so it stays put.
            const phase = spinPhase(sw) * w;
            pose.rz += Math.sin(TAU * 2 * sw) * 0.015 * phase;
            pose.rx += Math.sin(TAU * 3 * sw) * 0.008 * phase;
          }
        }
      } else {
        // On the ring, vials shrink with distance so the lit center vial leads (fog dims them too).
        scale = 1 - Math.min(Math.abs(o), 3) * 0.09 * (1 - v.row);
        const side = Math.sign(o) || 1;
        pose.x += side * v.sideFade * 8;
        pose.z -= v.sideFade * 3;
      }

      const want = this.hover === i ? v.row : 0;
      this.lift[i] += (want - this.lift[i]) * (1 - Math.exp(-dt * 8));
      pose.y += this.lift[i] * 0.35;

      pose.x += input.mx * 0.2 * v.mouse;
      pose.rx += input.my * 0.15 * v.mouse;
      pose.rz -= input.mx * 0.1 * v.mouse;
      const m = this.models[i];
      m.group.position.set(pose.x, pose.y, pose.z);
      m.group.rotation.set(pose.rx, pose.ry, pose.rz);
      if (spin) m.group.rotateY(spin);
      m.group.scale.setScalar(scale);

      const target = w > 0 ? jumpLabel ?? labelTarget(v.walk, i, n) : i;
      if (target !== m.labelIndex) {
        const hidden = w === 0 || crossed || (reduced ? dipScale(v.walk) < 0.4 : facesAway(labelToward(m.group)));
        if (hidden) m.setLabel(target);
      }
    }
  }
}
