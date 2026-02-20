/**
 * SEO Constants
 * Centralized configuration for SEO-related values
 */

export const SEO_CONFIG = {
  // Site Information
  siteName: 'Ramadan Clock',
  siteUrl: process.env.NEXTAUTH_URL || 'https://ramadanclock.com',
  siteDescription: 'Accurate Sehri and Iftar times for Ramadan. View daily schedules, download calendars, and stay on track during the holy month.',
  
  // Social Media
  twitterHandle: '@RamadanClock',
  ogImageDefault: '/og-image.png',
  
  // Keywords
  primaryKeywords: [
    'Ramadan times',
    'Sehri Iftar schedule',
    'Ramadan calendar',
    'Islamic fasting times',
    'prayer times Ramadan',
    'Ramadan timetable',
  ] as string[],
  
  // Hijri Year (1446 AH for 2025)
  hijriYear: '1446 AH',
  
  // PWA
  themeColor: '#3b82f6',
  backgroundColor: '#ffffff',
  
  // Open Graph
  ogType: 'website',
  ogLocale: 'en_US',
  
  // Twitter Card
  twitterCardType: 'summary_large_image',
  
  // Canonical URL handling
  includeTrailingSlash: false,
  
  // Sitemap
  sitemapChangeFrequency: {
    home: 'daily',
    calendar: 'daily',
    location: 'daily',
    contact: 'monthly',
  } as const,
  
  sitemapPriority: {
    home: 1.0,
    calendar: 0.9,
    location: 0.8,
    contact: 0.5,
  } as const,
  
  // Robots
  disallowedPaths: ['/admin/', '/auth/', '/api/'],
  
  // Metadata length limits
  titleMaxLength: 60,
  descriptionMaxLength: 160,
} as const;

export type SitemapChangeFrequency = typeof SEO_CONFIG.sitemapChangeFrequency[keyof typeof SEO_CONFIG.sitemapChangeFrequency];
