import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ASSESSMENT_URL, CATEGORIES, PRODUCTS, PRODUCT_COUNT, pad2, productUrl, wrapIndex } from '@/lib/products';

// Same rules as slugify() in ../bodybuilding-peptides/src/utils-peptides/functions.ts, which builds the live URLs.
const slugify = (s: string) =>
  s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase()
    .replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

describe('products', () => {
  it('lists the 12 vials in walk order', () => {
    expect(PRODUCT_COUNT).toBe(12);
    expect(PRODUCTS[0].name).toBe('CJC-1295 / Ipamorelin');
    expect(PRODUCTS[11].name).toBe('Semax / Selank');
  });

  it('uses the live site slugs and unique ids', () => {
    for (const p of PRODUCTS) expect(p.id).toBe(slugify(p.name));
    expect(new Set(PRODUCTS.map((p) => p.id)).size).toBe(12);
  });

  it('builds trybbpeptides.com product URLs', () => {
    for (const p of PRODUCTS) {
      expect(productUrl(p)).toMatch(/^https:\/\/www\.trybbpeptides\.com\/(muscle-growth|recovery-and-vitality|neuro-and-cognitive)\/[a-z0-9-]+$/);
    }
    expect(productUrl(PRODUCTS[3])).toBe('https://www.trybbpeptides.com/muscle-growth/mots-c');
    expect(ASSESSMENT_URL).toBe('https://intake.trybbpeptides.com/s/assessment');
  });

  it('has complete copy with no em dashes', () => {
    for (const p of PRODUCTS) {
      expect(p.focus).toHaveLength(3);
      for (const s of [p.name, p.short, p.strength, p.vial, p.about, ...p.focus]) {
        expect(s.trim().length).toBeGreaterThan(0);
        expect(s).not.toMatch(/[\u2014\u2013]/);
      }
      expect(p.about.length).toBeLessThan(200);
      expect(CATEGORIES[p.category]).toBeDefined();
    }
  });

  it('ships a render for every product', () => {
    for (const p of PRODUCTS) expect(existsSync(join(process.cwd(), 'public', p.render))).toBe(true);
  });

  it('wraps indices and pads numbers', () => {
    expect(wrapIndex(12)).toBe(0);
    expect(wrapIndex(-1)).toBe(11);
    expect(pad2(3)).toBe('03');
  });
});
