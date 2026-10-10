import { describe, expect, it } from 'vitest';
import { FLAVORS, doseLabel, wrapIndex } from '@/lib/flavors';

describe('flavors', () => {
  it('lists four flavors in hero order', () => {
    expect(FLAVORS.map((f) => f.id)).toEqual(['mango', 'peach', 'lemonade', 'cherry']);
  });
  it('uses 6-digit hex colors', () => {
    for (const f of FLAVORS) for (const c of Object.values(f.colors)) expect(c).toMatch(/^#[0-9A-F]{6}$/i);
  });
  it('matches the label facts', () => {
    const by = Object.fromEntries(FLAVORS.map((f) => [f.id, f]));
    expect([by.mango.thc, by.mango.cbd, by.mango.juicePct]).toEqual([2, 20, 13]);
    expect([by.peach.thc, by.peach.cbd, by.peach.juicePct]).toEqual([5, 15, 15]);
    expect([by.lemonade.thc, by.lemonade.cbd, by.lemonade.juicePct]).toEqual([5, 125, 16]);
    expect([by.cherry.thc, by.cherry.cbd, by.cherry.juicePct]).toEqual([5, 125, 11]);
  });
  it('wraps indices both ways', () => {
    expect(wrapIndex(-1)).toBe(3);
    expect(wrapIndex(4)).toBe(0);
    expect(wrapIndex(9)).toBe(1);
  });
  it('formats the dose', () => {
    expect(doseLabel(FLAVORS[0])).toBe('2mg THC + 20mg CBD');
  });
  it('has no em dashes in any copy', () => {
    expect(JSON.stringify(FLAVORS)).not.toMatch(/\u2014/);
  });
});
