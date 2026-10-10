import { FAQS } from './content';
import { FLAVORS, PRODUCT_URL, doseLabel } from './flavors';
import { SITE, absoluteUrl } from './site';

// One @graph for the page: who makes it, the site, the product line with its four flavors, and the FAQ.
export function structuredData() {
  const org = { '@id': `${SITE.companyUrl}/#organization` };
  const brand = { '@type': 'Brand', name: 'Hiatus' };
  const adults = { '@type': 'PeopleAudience', suggestedMinAge: 21 };
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', ...org, name: SITE.company, url: SITE.companyUrl },
      {
        '@type': 'WebSite',
        '@id': absoluteUrl('/#website'),
        url: absoluteUrl('/'),
        name: SITE.name,
        description: SITE.description,
        inLanguage: 'en-US',
        publisher: org,
      },
      {
        '@type': 'ProductGroup',
        '@id': absoluteUrl('/#product'),
        name: SITE.name,
        description: SITE.description,
        url: PRODUCT_URL,
        brand,
        manufacturer: org,
        audience: adults,
        image: FLAVORS.map((f) => absoluteUrl(f.images.product)),
        hasVariant: FLAVORS.map((f) => ({
          '@type': 'Product',
          name: `Hiatus ${f.name} THC Seltzer`,
          description: `${f.short} ${doseLabel(f)} per 12 oz can, ${f.juicePct}% organic juice, ${f.calories} calories.`,
          image: absoluteUrl(f.images.product),
          url: PRODUCT_URL,
          brand,
          audience: adults,
          additionalProperty: [
            { '@type': 'PropertyValue', name: 'THC', value: f.thc, unitText: 'mg' },
            { '@type': 'PropertyValue', name: 'CBD', value: f.cbd, unitText: 'mg' },
            { '@type': 'PropertyValue', name: 'Organic juice', value: f.juicePct, unitText: '%' },
            { '@type': 'PropertyValue', name: 'Calories', value: f.calories },
            { '@type': 'PropertyValue', name: 'Alcohol', value: 0, unitText: '%' },
          ],
        })),
      },
      {
        '@type': 'FAQPage',
        '@id': absoluteUrl('/#faq'),
        mainEntity: FAQS.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      },
    ],
  };
}
