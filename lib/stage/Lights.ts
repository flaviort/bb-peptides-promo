import * as THREE from 'three';
import type { SceneValues } from './values';
import type { LightMix } from './walk';

// The overhead Light Blue spot pools on the center vial; an Electric Blue rim comes from below and behind.
// rigY lifts the spot out of play between sections. Category light (lib/stage/walk.ts) cools the rim
// toward Light Blue for recovery and narrows the spot for neuro.
const SPOT_Y = 2.4;
const SPOT_TARGET_Y = -1.8;
const ELECTRIC = new THREE.Color('#3B60FF');
const LIGHT = new THREE.Color('#89B5FC');
const WHITE = new THREE.Color('#FFFFFF');

export class Lights {
  private readonly key = new THREE.DirectionalLight(0xf4f7ff, 1);
  private readonly rim = new THREE.DirectionalLight(0x3b60ff, 1);
  private readonly hemi = new THREE.HemisphereLight(0xdfe8ff, 0x111111, 1);
  private readonly stage = new THREE.SpotLight(0x89b5fc, 0, 12, 0.42, 0.7, 1.2);
  private readonly accent = new THREE.SpotLight(0xffffff, 0, 18, 0.32, 0.85, 1);
  private readonly tint = ELECTRIC.clone();
  private readonly tintTarget = ELECTRIC.clone();

  constructor(scene: THREE.Scene) {
    this.key.position.set(3, 4, 6);
    this.rim.position.set(-4, -1.5, -3);
    this.stage.position.set(0, SPOT_Y, 0.2);
    this.stage.target.position.set(0, SPOT_TARGET_Y, 0);
    this.stage.color.copy(WHITE).lerp(LIGHT, 0.6);
    this.accent.position.set(3, 5, 5);
    this.accent.target.position.set(0.6, 0, 0);
    scene.add(this.key, this.rim, this.hemi, this.stage, this.stage.target, this.accent, this.accent.target);
  }

  apply(v: SceneValues, dt: number, mix: LightMix) {
    this.tintTarget.copy(ELECTRIC).lerp(LIGHT, mix.light + mix.beam * 0.5);
    this.tint.lerp(this.tintTarget, 1 - Math.exp(-dt * 4));
    this.key.intensity = v.key * 1.3;
    this.rim.intensity = v.rim * 1.6 * (1 - 0.4 * mix.beam);
    this.rim.color.copy(this.tint);
    this.hemi.intensity = v.ambient * (1 - 0.5 * mix.beam);
    this.stage.intensity = v.stageLight * 32 * (1 + 0.3 * mix.beam);
    this.stage.angle = 0.42 - 0.16 * mix.beam;
    this.stage.position.y = SPOT_Y + v.rigY * 12;
    this.accent.intensity = v.accent * 60;
    this.accent.color.copy(WHITE).lerp(this.tint, 0.35);
  }
}
