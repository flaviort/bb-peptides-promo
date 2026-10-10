// Canonical origin for metadata, the sitemap and structured data. Set NEXT_PUBLIC_SITE_URL once the
// production domain is known; on Vercel it falls back to the project's production domain.
const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const SITE_URL = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? (vercelProd ? `https://${vercelProd}` : 'http://localhost:3000'),
);

export const SITE = {
  name: 'Bodybuilding Peptides +',
  shortName: 'BB Peptides',
  title: 'Bodybuilding Peptides + | Physician-guided peptides, started online',
  description:
    'Explore 12 physician-guided peptides for muscle growth, recovery and focus, from CJC-1295 / Ipamorelin to BPC-157. Start your online assessment and a licensed provider reviews it.',
  company: 'Bodybuilding Peptides, Inc.',
  companyUrl: 'https://www.trybbpeptides.com',
  ink: '#111111',
} as const;

export const absoluteUrl = (path: string) => new URL(path, SITE_URL).toString();
