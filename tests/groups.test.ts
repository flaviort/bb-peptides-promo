import { expect, it } from 'vitest';
import { productGroups } from '@/lib/products';

it('groups the walk by category, keeping each product’s walk index', () => {
  const g = productGroups();
  expect(g.map((x) => x.name)).toEqual(['Muscle Growth', 'Recovery & Vitality', 'Neuro & Cognitive']);
  expect(g.map((x) => x.items.length)).toEqual([4, 7, 1]);
  expect(g[1].items[0]).toMatchObject({ index: 4, product: { id: 'bpc-157' } });
  expect(g[2].items[0].index).toBe(11);
});
