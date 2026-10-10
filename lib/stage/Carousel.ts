import * as THREE from 'three';
import type { Can } from './Can';
import type { SceneValues } from './values';
import {
  blendPose, carouselPose, flavorAtPos, focusPose, nearestSlotForFlavor, rowPose, wrapOffset, type CanPose,
} from './layout';

export interface FrameInput { mx: number; my: number }

export class Carousel {
  readonly group = new THREE.Group();
  pos = 0;
  target = 0;
  private time = 0;
  private center = 0;

  constructor(private readonly cans: Can[], private readonly flavorCount: number) {
    cans.forEach((c) => this.group.add(c.group));
  }

  get flavor(): number {
    return flavorAtPos(this.target, this.flavorCount);
  }

  get centerCan(): Can {
    return this.cans[this.center];
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

  goToFlavor(f: number) {
    this.target = nearestSlotForFlavor(this.target, f, this.flavorCount);
  }

  update(dt: number, v: SceneValues, input: FrameInput) {
    this.time += dt;
    this.pos += (this.target - this.pos) * (1 - Math.exp(-dt * 5));
    const n = this.cans.length;

    let best = Infinity;
    for (let i = 0; i < n; i++) {
      const o = Math.abs(wrapOffset(i, this.pos, n));
      if (o < best) { best = o; this.center = i; }
    }

    for (let i = 0; i < n; i++) {
      const o = wrapOffset(i, this.pos, n);
      let pose: CanPose = blendPose(carouselPose(o, v), rowPose(o, v.spread), v.row);
      // Idle wobble keeps each label mostly facing front instead of spinning away.
      pose.ry += Math.sin(this.time * 0.4 + i * 1.7) * 0.5;
      if (i === this.center) {
        pose = blendPose(pose, focusPose(v), v.focus * (1 - Math.min(1, Math.abs(o) * 2)));
      } else {
        const side = Math.sign(o) || 1;
        pose.x += side * v.sideFade * 8;
        pose.z -= v.sideFade * 3;
      }
      pose.x += input.mx * 0.2 * v.mouse;
      pose.rx += input.my * 0.15 * v.mouse;
      pose.rz -= input.mx * 0.1 * v.mouse;
      const g = this.cans[i].group;
      g.position.set(pose.x, pose.y, pose.z);
      g.rotation.set(pose.rx, pose.ry, pose.rz);
    }
  }
}
