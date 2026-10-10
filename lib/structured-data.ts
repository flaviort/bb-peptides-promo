import { FAQS } from './content';
import { PRODUCTS, SITE_ORIGIN, productUrl } from './products';
import { SITE, absoluteUrl } from './site';

// One @graph for the page: who runs it, the site, the 12 vials (each pointing at its live product page), and the FAQ.
export function structuredData() {
  const org = { '@id': `${SITE_ORIGIN}/#organization` };
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', ...org, name: SITE.company, url: SITE.companyUrl, logo: absoluteUrl('/logos/bb-peptides-full-white.svg') },
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
        '@type': 'ItemList',
        '@id': absoluteUrl('/#products'),
        name: 'Bodybuilding Peptides + vials',
        numberOfItems: PRODUCTS.length,
        itemListElement: PRODUCTS.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: p.name,
          url: productUrl(p),
          image: absoluteUrl(p.render),
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
