import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { VIAL_HEIGHT, VIAL_R, VialModel, createVialGeometries, createVialMaterials } from '@/lib/stage/Vial';

const box = (g: THREE.BufferGeometry) => {
  g.computeBoundingBox();
  return g.boundingBox!;
};

describe('vial geometry', () => {
  const geo = createVialGeometries();
  it('stacks glass, crimp and cap from the bottom up', () => {
    expect(box(geo.glass).min.y).toBeCloseTo(0, 1);
    expect(box(geo.crimp).min.y).toBeGreaterThan(box(geo.glass).max.y - 0.1);
    expect(box(geo.cap).min.y).toBeGreaterThanOrEqual(box(geo.crimp).max.y - 1e-6);
    expect(box(geo.cap).max.y).toBeCloseTo(VIAL_HEIGHT);
  });
  it('wraps the label just outside the glass', () => {
    expect(box(geo.label).max.x).toBeGreaterThan(VIAL_R);
    expect(box(geo.glass).max.x).toBeLessThanOrEqual(VIAL_R + 1e-6);
  });
});

describe('VialModel', () => {
  it('starts on its own label and swaps the map in place', () => {
    const labels = [new THREE.Texture(), new THREE.Texture(), new THREE.Texture()];
    const mats = createVialMaterials('low');
    const m = new VialModel(createVialGeometries(), mats, labels, 1);
    expect(m.labelIndex).toBe(1);
    const labelMesh = m.group.getObjectsByProperty('name', 'label')[0] as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
    expect(labelMesh.material.map).toBe(labels[1]);
    m.setLabel(2);
    expect(m.labelIndex).toBe(2);
    expect(labelMesh.material.map).toBe(labels[2]);
    m.dispose();
    mats.dispose();
  });
  it('centers the vial on its origin', () => {
    const m = new VialModel(createVialGeometries(), createVialMaterials('low'), [new THREE.Texture()], 0);
    const b = new THREE.Box3().setFromObject(m.group);
    expect(Math.abs(b.min.y + b.max.y)).toBeLessThan(0.05);
  });
});
