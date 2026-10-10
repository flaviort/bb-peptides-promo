import * as THREE from 'three';
import type { SceneValues } from './values';

// The overhead spot that pools light on the center can. rigY lifts it out of play between sections.
const SPOT_Y = 2.4;
const SPOT_TARGET_Y = -1.8;

export class Lights {
  private readonly key = new THREE.DirectionalLight(0xfff1dd, 1);
  private readonly rim = new THREE.DirectionalLight(0xffd2a8, 1);
  private readonly hemi = new THREE.HemisphereLight(0xfff6ea, 0xe6c49c, 1);
  private readonly stage = new THREE.SpotLight(0xfff1d6, 0, 12, 0.42, 0.7, 1.2);
  private readonly accent = new THREE.SpotLight(0xffffff, 0, 18, 0.32, 0.85, 1);
  private readonly tint = new THREE.Color('#F4A957');
  private readonly tintTarget = new THREE.Color('#F4A957');
  private readonly white = new THREE.Color(0xffffff);

  constructor(scene: THREE.Scene) {
    this.key.position.set(3, 4, 6);
    this.rim.position.set(-4, 2.5, -3);
    this.stage.position.set(0, SPOT_Y, 0.2);
    this.stage.target.position.set(0, SPOT_TARGET_Y, 0);
    this.accent.position.set(3, 5, 5);
    this.accent.target.position.set(0.6, 0, 0);
    scene.add(this.key, this.rim, this.hemi, this.stage, this.stage.target, this.accent, this.accent.target);
  }

  setTint(hex: string) {
    this.tintTarget.set(hex);
  }

  apply(v: SceneValues, dt: number) {
    this.tint.lerp(this.tintTarget, 1 - Math.exp(-dt * 4));
    this.key.intensity = v.key * 2;
    this.rim.intensity = v.rim * 1.6;
    this.rim.color.copy(this.white).lerp(this.tint, 0.5);
    this.hemi.intensity = v.ambient;
    this.stage.intensity = v.stageLight * 60;
    this.stage.position.y = SPOT_Y + v.rigY * 12;
    this.accent.intensity = v.accent * 60;
    this.accent.color.copy(this.white).lerp(this.tint, 0.35);
  }
}
