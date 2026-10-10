import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { CANDIDATE_NOTE, COPYRIGHT, FAQS, FOOTER_LINKS, HOW_IT_WORKS, LEGAL, SOCIAL } from '@/lib/content';

it('carries the live site FAQ and three steps', () => {
  expect(FAQS.map((f) => f.q)).toEqual([
    'What are peptides?',
    'How do I choose the right peptide?',
    'How should I store my peptides?',
    'Do I need a healthcare provider before use?',
  ]);
  expect(HOW_IT_WORKS).toHaveLength(3);
});

it('has no em or en dashes anywhere', () => {
  const all = [
    CANDIDATE_NOTE, COPYRIGHT, LEGAL,
    ...FAQS.flatMap((f) => [f.q, f.a]),
    ...HOW_IT_WORKS.flatMap((s) => [s.title, s.body]),
    ...FOOTER_LINKS.map((l) => l.label),
  ];
  for (const s of all) expect(s).not.toMatch(/[\u2014\u2013]/);
});

it('links only to trybbpeptides.com and ships every social icon', () => {
  for (const l of FOOTER_LINKS) expect(l.href.startsWith('https://www.trybbpeptides.com')).toBe(true);
  expect(SOCIAL).toHaveLength(5);
  for (const s of SOCIAL) expect(existsSync(join(process.cwd(), 'public/social', `${s.id}.svg`))).toBe(true);
});
