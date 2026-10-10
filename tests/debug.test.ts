import { expect, it } from 'vitest';
import { readDebug } from '@/lib/debug';

it('parses section ids, indices and flavors', () => {
  expect(readDebug('?gate=skip&section=benefit-2&flavor=cherry')).toEqual({ skipGate: true, section: 3, flavor: 3 });
  expect(readDebug('?section=8')).toEqual({ skipGate: false, section: 8, flavor: null });
  expect(readDebug('?section=bogus&flavor=nope')).toEqual({ skipGate: false, section: null, flavor: null });
});
