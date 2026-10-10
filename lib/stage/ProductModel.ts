import type * as THREE from 'three';

// What the carousel and stage know about a product object. The procedural vial implements it today;
// a Blender model per packaging type (capsule bottle, nasal spray) can implement it later.
export interface ProductModel {
  /** Posed every frame by the carousel: position, rotation and scale. */
  readonly group: THREE.Group;
  /** Index into PRODUCTS of the label currently shown. */
  readonly labelIndex: number;
  setLabel(index: number): void;
  dispose(): void;
}
