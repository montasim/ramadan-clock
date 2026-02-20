/**
 * Dynamic Sitemap Generator
 * Generates XML sitemap for all pages including dynamic location pages
 */

import { MetadataRoute } from 'next';
import { getLocations } from '@/actions/time-entries';
import { SEO_CONFIG } from '@/lib/seo/constants';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SEO_CONFIG.siteUrl,
      lastModified: new Date(),
      changeFrequency: SEO_CONFIG.sitemapChangeFrequency.home,
      priority: SEO_CONFIG.sitemapPriority.home,
    },
    {
      url: `${SEO_CONFIG.siteUrl}/calendar`,
      lastModified: new Date(),
      changeFrequency: SEO_CONFIG.sitemapChangeFrequency.calendar,
      priority: SEO_CONFIG.sitemapPriority.calendar,
    },
    {
      url: `${SEO_CONFIG.siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: SEO_CONFIG.sitemapChangeFrequency.contact,
      priority: SEO_CONFIG.sitemapPriority.contact,
    },
  ];

  // Dynamic location pages
  let locationPages: MetadataRoute.Sitemap = [];
  try {
    const locations = await getLocations();
    locationPages = locations.map((location) => ({
      url: `${SEO_CONFIG.siteUrl}/location/${encodeURIComponent(location)}`,
      lastModified: new Date(),
      changeFrequency: SEO_CONFIG.sitemapChangeFrequency.location,
      priority: SEO_CONFIG.sitemapPriority.location,
    }));
  } catch (error) {
    console.error('Error fetching locations for sitemap:', error);
  }

  return [...staticPages, ...locationPages];
}
