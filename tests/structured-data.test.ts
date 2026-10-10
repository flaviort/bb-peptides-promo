import { expect, it } from 'vitest';
import { structuredData } from '@/lib/structured-data';
import { PRODUCTS, productUrl } from '@/lib/products';

it('describes the organization, site, the 12 vials and the FAQ', () => {
  const g = structuredData()['@graph'] as Record<string, unknown>[];
  expect(g.map((n) => n['@type'])).toEqual(['Organization', 'WebSite', 'ItemList', 'FAQPage']);
  const list = g[2] as { itemListElement: { url: string; position: number }[] };
  expect(list.itemListElement.map((i) => i.url)).toEqual(PRODUCTS.map(productUrl));
  expect(list.itemListElement[0].position).toBe(1);
  expect((g[3] as { mainEntity: unknown[] }).mainEntity).toHaveLength(4);
});
