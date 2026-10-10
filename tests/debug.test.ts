import { expect, it } from 'vitest';
import { readDebug } from '@/lib/debug';

it('parses section ids, indices and products', () => {
  expect(readDebug('?intro=skip&section=p03&product=tb-500')).toEqual({ skipIntro: true, section: 3, product: 5 });
  expect(readDebug('?section=13')).toEqual({ skipIntro: false, section: 13, product: null });
  expect(readDebug('?section=bogus&product=nope')).toEqual({ skipIntro: false, section: null, product: null });
});
