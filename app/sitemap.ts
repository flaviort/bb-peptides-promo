import type { MetadataRoute } from 'next';
import { FLAVORS } from '@/lib/flavors';
import { absoluteUrl } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl('/'),
      changeFrequency: 'monthly',
      priority: 1,
      images: FLAVORS.map((f) => absoluteUrl(f.images.product)),
    },
  ];
}
