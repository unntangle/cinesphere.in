import type { MetadataRoute } from 'next';
import { BRAND } from '@/lib/constants';

/**
 * /sitemap.xml — generated at build time from the site's real routes.
 *
 * Next.js serves this automatically at /sitemap.xml and references it from
 * robots.txt (see robots.ts). The homepage carries the highest priority; the
 * dedicated sub-pages follow. Add new routes to the `routes` list below.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = BRAND.url;
  const lastModified = new Date();

  const routes: { path: string; priority: number }[] = [
    { path: '', priority: 1 },
    { path: '/brands', priority: 0.8 },
    { path: '/clients', priority: 0.8 },
    { path: '/gallery', priority: 0.8 },
    { path: '/contact', priority: 0.7 },
  ];

  return routes.map(({ path, priority }) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency: 'monthly',
    priority,
  }));
}
