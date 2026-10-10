// The 12 injectable vials, in walk order. Single source of truth for product facts.
// Sources: ../bodybuilding-peptides/src/db-peptides/products/*.ts (about text, focus bullets) and
// catalog-dosage.ts (supplied strength, not a dosing schedule). Descriptions are condensed from the
// about text and keep only claims it makes. Melanotan II has no catalog row: its strength is read
// off the product render and needs the client's confirmation.

export type CategorySlug = 'muscle-growth' | 'recovery-and-vitality' | 'neuro-and-cognitive';
export type LightKind = 'electric' | 'light' | 'beam';

export interface Product {
  id: string;
  name: string;
  /** Short display word for the ghosted outline behind the vial. */
  short: string;
  category: CategorySlug;
  strength: string;
  vial: string;
  about: string;
  focus: readonly [string, string, string];
  render: string;
}

export const SITE_ORIGIN = 'https://www.trybbpeptides.com';
export const ASSESSMENT_URL = 'https://intake.trybbpeptides.com/s/assessment';

export const CATEGORIES: Record<CategorySlug, { name: string; light: LightKind }> = {
  'muscle-growth': { name: 'Muscle Growth', light: 'electric' },
  'recovery-and-vitality': { name: 'Recovery & Vitality', light: 'light' },
  'neuro-and-cognitive': { name: 'Neuro & Cognitive', light: 'beam' },
};

export const CATEGORY_ORDER: readonly CategorySlug[] = ['muscle-growth', 'recovery-and-vitality', 'neuro-and-cognitive'];

const render = (id: string) => `/renders/${id}.webp`;

export const PRODUCTS: readonly Product[] = [
  {
    id: 'cjc-1295-ipamorelin', name: 'CJC-1295 / Ipamorelin', short: 'CJC-1295', category: 'muscle-growth',
    strength: '1.5 mg / 2.5 mg per mL', vial: '6 mL',
    about: 'Complementary peptides used together in physician-directed protocols that support the body’s natural growth hormone production.',
    focus: ['Growth Hormone Production', 'Recovery Support', 'Body Composition'], render: render('cjc-1295-ipamorelin'),
  },
  {
    id: 'tesamorelin', name: 'Tesamorelin', short: 'Tesamorelin', category: 'muscle-growth',
    strength: '3 mg/mL', vial: '5 mL',
    about: 'A synthetic peptide that supports the body’s natural release of growth hormone, used in physician-guided plans for select metabolic and body composition goals.',
    focus: ['Growth Hormone Support', 'Lean Muscle Preservation', 'Metabolic Health'], render: render('tesamorelin'),
  },
  {
    id: 'tesamorelin-ipamorelin', name: 'Tesamorelin / Ipamorelin', short: 'Tesa / Ipa', category: 'muscle-growth',
    strength: '3 mg / 2 mg per mL', vial: '5 mL',
    about: 'Tesamorelin and Ipamorelin in one physician-guided protocol designed to support the body’s natural growth hormone signaling.',
    focus: ['Growth Hormone Signaling', 'Recovery Support', 'Body Composition'], render: render('tesamorelin-ipamorelin'),
  },
  {
    id: 'mots-c', name: 'MOTS-C', short: 'MOTS-C', category: 'muscle-growth',
    strength: '2 mg/mL', vial: '5 mL',
    about: 'A naturally occurring mitochondrial peptide associated with cellular energy production and metabolic health.',
    focus: ['Cellular Energy', 'Exercise Performance', 'Healthy Aging'], render: render('mots-c'),
  },
  {
    id: 'bpc-157', name: 'BPC-157', short: 'BPC-157', category: 'recovery-and-vitality',
    strength: '3 mg/mL', vial: '5 mL',
    about: 'A synthetic peptide that has gained attention for its potential role in supporting the body’s natural healing and recovery processes.',
    focus: ['Natural Healing', 'Recovery & Mobility', 'Tissue Health'], render: render('bpc-157'),
  },
  {
    id: 'tb-500', name: 'TB-500', short: 'TB-500', category: 'recovery-and-vitality',
    strength: '10 mg / 3 mL', vial: '3 mL',
    about: 'A synthetic peptide often included in physician-guided protocols focused on recovery, mobility and tissue health.',
    focus: ['Recovery & Mobility', 'Tissue Health', 'Physical Performance'], render: render('tb-500'),
  },
  {
    id: 'wolverine-blend', name: 'Wolverine Blend', short: 'Wolverine', category: 'recovery-and-vitality',
    strength: '1.66 mg / 3.33 mg per mL', vial: '3 mL',
    about: 'BPC-157 and TB-500 in one formulation, used in physician-guided programs focused on recovery, mobility and tissue health.',
    focus: ['Recovery & Mobility', 'Tissue Health', 'Active Lifestyle'], render: render('wolverine-blend'),
  },
  {
    id: 'glow-blend', name: 'Glow Blend', short: 'Glow', category: 'recovery-and-vitality',
    strength: '9 mg / 1.66 mg / 3.33 mg per mL', vial: '3 mL',
    about: 'GHK-Cu, BPC-157 and TB-500 in a physician-directed formulation designed to support skin health, tissue recovery and overall rejuvenation.',
    focus: ['Skin Health', 'Tissue Recovery', 'Overall Rejuvenation'], render: render('glow-blend'),
  },
  {
    id: 'epitalon', name: 'Epitalon', short: 'Epitalon', category: 'recovery-and-vitality',
    strength: '2 mg/mL', vial: '5 mL',
    about: 'A synthetic peptide of interest in healthy aging medicine for its potential role in supporting cellular health and overall wellness.',
    focus: ['Cellular Health', 'Healthy Aging', 'Long-Term Vitality'], render: render('epitalon'),
  },
  {
    id: 'thymosin-alpha-1', name: 'Thymosin Alpha-1', short: 'Thymosin', category: 'recovery-and-vitality',
    strength: '5 mg/mL', vial: '5 mL',
    about: 'A naturally occurring peptide involved in supporting normal immune system function, used in physician-directed wellness programs.',
    focus: ['Immune Function', 'Immune Health', 'Overall Resilience'], render: render('thymosin-alpha-1'),
  },
  {
    id: 'melanotan-ii', name: 'Melanotan II', short: 'Melanotan', category: 'recovery-and-vitality',
    strength: '2 mg / 1 mL', vial: '5 mL',
    about: 'A synthetic peptide that may support the skin’s natural tanning response by stimulating melanin production.',
    focus: ['Melanin Production', 'Even Skin Tone', 'Personalized Tanning'], render: render('melanotan-ii'),
  },
  {
    id: 'semax-selank', name: 'Semax / Selank', short: 'Semax', category: 'neuro-and-cognitive',
    strength: '1 mg / 1 mg per mL', vial: '5 mL',
    about: 'Semax and Selank in one physician-guided protocol, for cognitive performance, focus and stress management.',
    focus: ['Cognitive Performance', 'Focus', 'Stress Management'], render: render('semax-selank'),
  },
];

export const PRODUCT_COUNT = PRODUCTS.length;

export function productUrl(p: Product): string {
  return `${SITE_ORIGIN}/${p.category}/${p.id}`;
}

export function wrapIndex(i: number, n: number = PRODUCT_COUNT): number {
  return ((i % n) + n) % n;
}

export const pad2 = (n: number): string => String(n).padStart(2, '0');
