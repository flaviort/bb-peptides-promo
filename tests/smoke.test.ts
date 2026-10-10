import { expect, it } from 'vitest';
import { cn } from '@/lib/cn';

it('joins truthy class names', () => {
  expect(cn('a', false, null, undefined, 'b')).toBe('a b');
});
