import { describe, expect, it } from 'vitest';
import { DEFAULT_VALUES, VALUE_KEYS } from '@/lib/stage/values';
import { buildKeyframes } from '@/lib/stage/keyframes';
import { buildMasterTimeline } from '@/lib/scroll/timeline';
import { LAST, RANGE, SECTIONS, sectionForProduct } from '@/lib/scroll/sections';

describe('keyframes', () => {
  const desk = buildKeyframes(false);
  const mob = buildKeyframes(true);
  it('has one complete frame per section', () => {
    expect(desk).toHaveLength(SECTIONS.length);
    for (const f of desk) expect(Object.keys(f).sort()).toEqual([...VALUE_KEYS].sort());
  });
  it('starts at the defaults', () => {
    expect(desk[0]).toEqual(DEFAULT_VALUES);
  });
  it('walks -1 on the hero, one product per section, 12 from the range on', () => {
    expect(desk[0].walk).toBe(-1);
    for (let i = 0; i < 12; i++) expect(desk[sectionForProduct(i)].walk).toBe(i);
    expect(desk[RANGE].walk).toBe(12);
    expect(desk[LAST].walk).toBe(12);
  });
  it('keeps the same walk on mobile, so a breakpoint change never changes the product', () => {
    expect(mob.map((f) => f.walk)).toEqual(desk.map((f) => f.walk));
  });
  it('frames the hero wider on mobile', () => {
    expect(mob[0].camZ).toBeGreaterThan(desk[0].camZ);
  });
});

describe('master timeline', () => {
  it('lands exactly on each section keyframe and interpolates linearly', () => {
    const v = { ...DEFAULT_VALUES };
    const frames = buildKeyframes(false);
    const tl = buildMasterTimeline(v, frames);
    expect(tl.duration()).toBe(LAST);
    for (const i of [1, 5, 12, RANGE, LAST]) {
      tl.seek(i);
      expect(v.camZ).toBeCloseTo(frames[i].camZ);
      expect(v.walk).toBeCloseTo(frames[i].walk);
      expect(v.row).toBeCloseTo(frames[i].row);
    }
    tl.seek(4.5);
    expect(v.walk).toBeCloseTo(3.5);
  });
});
