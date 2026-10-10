import { describe, expect, it } from 'vitest';
import { DEFAULT_VALUES, VALUE_KEYS } from '@/lib/stage/values';
import { buildKeyframes } from '@/lib/stage/keyframes';
import { buildMasterTimeline } from '@/lib/scroll/timeline';
import { LAST, SECTIONS } from '@/lib/scroll/sections';

describe('keyframes', () => {
  const desk = buildKeyframes(false);
  it('has one complete frame per section', () => {
    expect(desk).toHaveLength(SECTIONS.length);
    for (const f of desk) expect(Object.keys(f).sort()).toEqual([...VALUE_KEYS].sort());
  });
  it('starts at the defaults', () => {
    expect(desk[0]).toEqual(DEFAULT_VALUES);
  });
  it('frames the hero wider on mobile', () => {
    expect(buildKeyframes(true)[0].camZ).toBeGreaterThan(desk[0].camZ);
  });
});

describe('master timeline', () => {
  it('lands exactly on each section keyframe and interpolates linearly', () => {
    const v = { ...DEFAULT_VALUES };
    const frames = buildKeyframes(false);
    const tl = buildMasterTimeline(v, frames);
    expect(tl.duration()).toBe(LAST);
    for (const i of [1, 3, 6, LAST]) {
      tl.seek(i);
      expect(v.camZ).toBeCloseTo(frames[i].camZ);
      expect(v.focusY).toBeCloseTo(frames[i].focusY);
      expect(v.row).toBeCloseTo(frames[i].row);
    }
    tl.seek(0.5);
    expect(v.camZ).toBeCloseTo((frames[0].camZ + frames[1].camZ) / 2);
  });
});
