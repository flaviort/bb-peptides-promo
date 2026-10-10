import { expect, it } from 'vitest';
import * as THREE from 'three';
import { CAN_H, CAN_R, LID_Y, createCanGeometries } from '@/lib/stage/Can';

it('wraps the label once around the wall and runs it the full painted length', () => {
  expect((2 * Math.PI * CAN_R) / CAN_H).toBeCloseTo(2400 / 1949, 4);
  const g = createCanGeometries();
  expect(g.body).toBeInstanceOf(THREE.LatheGeometry);
  const uv = g.body.attributes.uv;
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < uv.count; i++) {
    min = Math.min(min, uv.getY(i));
    max = Math.max(max, uv.getY(i));
  }
  expect([min, max]).toEqual([0, 1]);
  const h = g.body.userData.height / 2;
  g.top.computeBoundingBox();
  g.bottom.computeBoundingBox();
  expect(g.top.boundingBox!.max.y).toBeGreaterThan(h + LID_Y);
  expect(g.bottom.boundingBox!.min.y).toBeLessThan(-h);
  // Painted height is a little shorter than CAN_H because the bands are curved.
  expect(g.body.userData.height).toBeLessThan(CAN_H);
});
