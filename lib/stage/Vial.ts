import * as THREE from 'three';
import type { ProductModel } from './ProductModel';

export type Quality = 'high' | 'low';

// A 5 mL serum vial in model units: body radius 0.5, base at y = 0. The client's renders are about
// 2:1 tall to wide, with the label over the lower two thirds of the body.
export const VIAL_R = 0.5;
const LABEL_Y0 = 0.14;
const LABEL_Y1 = 0.88;
export const LABEL_H = LABEL_Y1 - LABEL_Y0;
const LABEL_R = VIAL_R + 0.006;
export const LABEL_ASPECT = (2 * Math.PI * LABEL_R) / LABEL_H;
// Canvas labels are drawn with the front panel centered; this turns it to face +z at ry = 0.
export const LABEL_FRONT_OFFSET = 0.5;
export const VIAL_HEIGHT = 1.86;
// Scales the vial to roughly the Hiatus can's height, so the carousel, row and camera keep their framing.
export const VIAL_SCALE = 1.3;

// Profiles as (radius, height) pairs, bottom to top so normals face out.
const GLASS: [number, number][] = [
  [0, 0.03], [0.3, 0.02], [0.42, 0], [0.48, 0.02], [0.5, 0.07], [0.5, 1.16],
  [0.49, 1.22], [0.45, 1.29], [0.36, 1.36], [0.3, 1.41], [0.29, 1.46], [0.29, 1.52],
];
const CRIMP: [number, number][] = [
  [0.29, 1.5], [0.35, 1.5], [0.37, 1.52], [0.37, 1.68], [0.35, 1.7], [0.3, 1.7],
];
const CAP: [number, number][] = [
  [0.3, 1.7], [0.39, 1.7], [0.405, 1.72], [0.41, 1.78], [0.405, 1.82], [0.37, 1.85], [0.3, VIAL_HEIGHT], [0, VIAL_HEIGHT],
];

export interface VialGeometries {
  glass: THREE.LatheGeometry;
  crimp: THREE.LatheGeometry;
  cap: THREE.LatheGeometry;
  label: THREE.CylinderGeometry;
  dispose(): void;
}

const lathe = (pts: [number, number][], segments = 96) =>
  new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), segments);

export function createVialGeometries(): VialGeometries {
  const label = new THREE.CylinderGeometry(LABEL_R, LABEL_R, LABEL_H, 128, 1, true);
  label.translate(0, (LABEL_Y0 + LABEL_Y1) / 2, 0);
  const g = { glass: lathe(GLASS, 128), crimp: lathe(CRIMP), cap: lathe(CAP), label };
  return { ...g, dispose: () => Object.values(g).forEach((x) => x.dispose()) };
}

export interface VialMaterials {
  glass: THREE.Material;
  /** Inner surface of the far wall, high tier only: gives the glass its thickness. */
  glassBack: THREE.Material | null;
  crimp: THREE.MeshStandardMaterial;
  cap: THREE.MeshStandardMaterial;
  label(map: THREE.Texture): THREE.MeshStandardMaterial;
  dispose(): void;
}

// Reflection-only glass: black with additive blending, so only the studio highlights render and
// the Ink page and its light pools show through. Transmission would render the transparent page as black.
function glassMaterial(high: boolean, side: THREE.Side, intensity: number): THREE.Material {
  const common = {
    color: 0x000000, roughness: 0.04, metalness: 0, envMapIntensity: intensity,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side,
  };
  return high
    ? new THREE.MeshPhysicalMaterial({ ...common, clearcoat: 1, clearcoatRoughness: 0.03 })
    : new THREE.MeshStandardMaterial(common);
}

export function createVialMaterials(quality: Quality): VialMaterials {
  const high = quality === 'high';
  const glass = glassMaterial(high, THREE.FrontSide, 1.1);
  const glassBack = high ? glassMaterial(true, THREE.BackSide, 0.45) : null;
  const crimp = new THREE.MeshStandardMaterial({ color: 0xd9dde4, metalness: 1, roughness: 0.22 });
  const cap = high
    ? new THREE.MeshPhysicalMaterial({ color: 0x3b60ff, roughness: 0.38, clearcoat: 0.5, clearcoatRoughness: 0.2, envMapIntensity: 0.4 })
    : new THREE.MeshStandardMaterial({ color: 0x3b60ff, roughness: 0.4, envMapIntensity: 0.4 });
  const label = (map: THREE.Texture) =>
    high
      ? new THREE.MeshPhysicalMaterial({ map, roughness: 0.5, metalness: 0, clearcoat: 0.3, clearcoatRoughness: 0.3, envMapIntensity: 0.35 })
      : new THREE.MeshStandardMaterial({ map, roughness: 0.55, metalness: 0, envMapIntensity: 0.35 });
  return {
    glass,
    glassBack,
    crimp,
    cap,
    label,
    dispose: () => [glass, glassBack, crimp, cap].forEach((m) => m?.dispose()),
  };
}

export class VialModel implements ProductModel {
  readonly group = new THREE.Group();
  private readonly labelMat: THREE.MeshStandardMaterial;
  private current: number;

  constructor(geo: VialGeometries, mats: VialMaterials, private readonly labels: readonly THREE.Texture[], own: number) {
    this.current = own;
    this.labelMat = mats.label(labels[own]);
    const label = new THREE.Mesh(geo.label, this.labelMat);
    label.name = 'label';
    const inner = new THREE.Group();
    // Opaque parts first; the additive glass shells draw last, over them.
    inner.add(label, new THREE.Mesh(geo.crimp, mats.crimp), new THREE.Mesh(geo.cap, mats.cap));
    if (mats.glassBack) {
      const back = new THREE.Mesh(geo.glass, mats.glassBack);
      back.renderOrder = 1;
      inner.add(back);
    }
    const front = new THREE.Mesh(geo.glass, mats.glass);
    front.renderOrder = 2;
    inner.add(front);
    inner.position.y = -VIAL_HEIGHT / 2;
    const holder = new THREE.Group();
    holder.scale.setScalar(VIAL_SCALE);
    holder.add(inner);
    this.group.add(holder);
    this.group.rotation.order = 'XZY';
  }

  get labelIndex(): number {
    return this.current;
  }

  setLabel(index: number) {
    if (index === this.current) return;
    this.current = index;
    // Every label texture shares one format, so swapping the map needs no shader recompile.
    this.labelMat.map = this.labels[index];
  }

  dispose() {
    this.labelMat.dispose();
  }
}
