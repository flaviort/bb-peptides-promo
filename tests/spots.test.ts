import { describe, expect, it } from 'vitest';
import { BENEFITS } from '@/lib/content';
import { buildKeyframes } from '@/lib/stage/keyframes';
import { LABEL_SPOTS, spotRect } from '@/lib/stage/spots';
import { DEFAULT_VALUES } from '@/lib/stage/values';

describe('label spots', () => {
  it('stay inside the label art', () => {
    for (const s of Object.values(LABEL_SPOTS)) {
      expect(s.x0).toBeGreaterThanOrEqual(0);
      expect(s.x1).toBeLessThanOrEqual(1);
      expect(s.x0).toBeLessThan(s.x1);
      expect(s.y0).toBeLessThan(s.y1);
    }
  });
  it('defaults the highlight rect to the first benefit, so it never slides in', () => {
    const r = spotRect(BENEFITS[0].spot);
    for (const k of ['hlU0', 'hlV0', 'hlU1', 'hlV1'] as const) expect(r[k]).toBeCloseTo(DEFAULT_VALUES[k], 6);
  });
  it('lights each benefit section on its own spot and keeps spinning one way', () => {
    const frames = buildKeyframes(false);
    const benefits = frames.slice(2, 6);
    benefits.forEach((f, i) => {
      expect(f.hl).toBe(1);
      expect(f.hlU0).toBe(spotRect(BENEFITS[i].spot).hlU0);
    });
    const spins = [frames[1], ...benefits, frames[6]].map((f) => f.focusRotY);
    for (let i = 1; i < spins.length; i++) expect(spins[i]).toBeGreaterThan(spins[i - 1]);
  });
});
