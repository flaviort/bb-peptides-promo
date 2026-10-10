// Canonical origin for metadata, the sitemap and structured data. Set NEXT_PUBLIC_SITE_URL once the
// production domain is known; on Vercel it falls back to the project's production domain.
const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const SITE_URL = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? (vercelProd ? `https://${vercelProd}` : 'http://localhost:3000'),
);

export const SITE = {
  name: 'Hiatus THC Seltzer',
  shortName: 'Hiatus',
  title: 'Hiatus THC Seltzer | A taste of time off',
  description:
    'Hemp-derived THC + CBD seltzer with organic fruit juice. Feel it in minutes, gone in about 90. Four flavors, zero alcohol, 21+.',
  tagline: 'A taste of time off',
  company: 'Cypress Hemp',
  companyUrl: 'https://www.cypresshemp.com',
  cream: '#F6EDDC',
} as const;

export const absoluteUrl = (path: string) => new URL(path, SITE_URL).toString();
