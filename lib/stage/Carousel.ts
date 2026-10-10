import * as THREE from 'three';
import type { ProductModel } from './ProductModel';
import type { SceneValues } from './values';
import {
  blendPose, carouselPose, focusPose, nearestSlotForProduct, productAtPos, rowPose, wrapOffset, type Pose,
} from './layout';
import { dipScale, facesAway, labelTarget, spinAngle, spinPhase } from './walk';

export interface FrameInput { mx: number; my: number }
export interface CarouselOptions { reduced: boolean }

export class Carousel {
  readonly group = new THREE.Group();
  pos = 0;
  target = 0;
  /** Product index hovered in the range row, or null. */
  hover: number | null = null;
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
    // A frame that crosses a half turn swaps at once, so even a coarse frame lands on the right label.
    // The first frame has shown nothing yet, so it may set any label (a deep link straight into the walk).
    const crossed = this.prevWalk === null || Math.round(this.prevWalk) !== Math.round(v.walk);
    this.prevWalk = v.walk;

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
      const w = i === this.center ? v.focus * (1 - Math.min(1, Math.abs(o) * 2)) : 0;
      if (i === this.center) {
        if (w > 0) {
          pose = blendPose(pose, focusPose(v), w);
          if (reduced) {
            scale = 1 + (dipScale(v.walk) - 1) * w;
          } else {
            // The spin is added after the blend, so it completes even while focus fades in or out.
            const phase = spinPhase(v.walk) * w;
            pose.ry += spinAngle(v.walk);
            pose.y -= 0.12 * phase;
            pose.rz *= 1 - 0.5 * phase;
          }
        }
      } else {
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
      m.group.scale.setScalar(scale);

      const target = w > 0 ? labelTarget(v.walk, i, n) : i;
      if (target !== m.labelIndex) {
        const hidden = w === 0 || crossed || (reduced ? dipScale(v.walk) < 0.4 : facesAway(pose.ry));
        if (hidden) m.setLabel(target);
      }
    }
  }
}
