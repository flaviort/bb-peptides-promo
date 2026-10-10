import type { MetadataRoute } from 'next';
import { PRODUCTS } from '@/lib/products';
import { absoluteUrl } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl('/'),
      changeFrequency: 'monthly',
      priority: 1,
      images: PRODUCTS.map((p) => absoluteUrl(p.render)),
    },
  ];
}
