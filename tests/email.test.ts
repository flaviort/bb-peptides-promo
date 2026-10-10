import { expect, it } from 'vitest';
import { isValidEmail } from '@/lib/email';

it('accepts normal addresses and rejects junk', () => {
  expect(isValidEmail('you@example.com')).toBe(true);
  expect(isValidEmail('  a.b+c@sub.example.co  ')).toBe(true);
  expect(isValidEmail('')).toBe(false);
  expect(isValidEmail('no-at.example.com')).toBe(false);
  expect(isValidEmail('a@b')).toBe(false);
  expect(isValidEmail('a b@example.com')).toBe(false);
});
