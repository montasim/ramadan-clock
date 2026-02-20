/**
 * SEO Metadata Generators
 * Functions for generating Next.js metadata objects, Open Graph tags,
 * Twitter Card tags, and canonical URLs.
 */

import type { Metadata } from 'next';
import { SEO_CONFIG } from './constants';

interface OpenGraph {
  type?: string;
  locale?: string;
  url?: string;
  title: string;
  description: string;
  siteName?: string;
  images?: Array<{
    url: string;
    width: number;
    height: number;
    alt: string;
  }>;
}

interface Twitter {
  card?: 'summary' | 'summary_large_image' | 'app' | 'player';
  title: string;
  description: string;
  images?: string[];
  creator?: string;
  site?: string;
}

/**
 * Get canonical URL for a given path
 */
export function getCanonicalUrl(path: string = ''): string {
  const baseUrl = SEO_CONFIG.siteUrl.replace(/\/$/, '');
  const cleanPath = path.replace(/^\//, '');
  return cleanPath ? `${baseUrl}/${cleanPath}` : baseUrl;
}

/**
 * Generate Open Graph metadata
 */
export function generateOpenGraph(options: {
  title: string;
  description: string;
  url?: string;
  images?: string[];
  type?: string;
  locale?: string;
}): OpenGraph {
  const { title, description, url, images, type, locale } = options;
  
  return {
    type: type || SEO_CONFIG.ogType,
    locale: locale || SEO_CONFIG.ogLocale,
    url: url || SEO_CONFIG.siteUrl,
    title,
    description,
    siteName: SEO_CONFIG.siteName,
    images: (images?.length ? images : [SEO_CONFIG.ogImageDefault]).map((image) => ({
      url: image,
      width: 1200,
      height: 630,
      alt: title,
    })),
  };
}

/**
 * Generate Twitter Card metadata
 */
export function generateTwitterCard(options: {
  title: string;
  description: string;
  images?: string[];
  cardType?: 'summary' | 'summary_large_image' | 'app' | 'player';
}): Twitter {
  const { title, description, images, cardType } = options;
  
  return {
    card: cardType || SEO_CONFIG.twitterCardType,
    title,
    description,
    images: (images?.length ? images : [SEO_CONFIG.ogImageDefault]) as string[],
    creator: SEO_CONFIG.twitterHandle,
    site: SEO_CONFIG.twitterHandle,
  };
}

/**
 * Generate base metadata for all pages
 */
export function getBaseMetadata(): Metadata {
  return {
    metadataBase: new URL(SEO_CONFIG.siteUrl),
    title: {
      default: SEO_CONFIG.siteName,
      template: `%s | ${SEO_CONFIG.siteName}`,
    },
    description: SEO_CONFIG.siteDescription,
    keywords: SEO_CONFIG.primaryKeywords,
    authors: [{ name: SEO_CONFIG.siteName }],
    creator: SEO_CONFIG.siteName,
    publisher: SEO_CONFIG.siteName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: SEO_CONFIG.ogType,
      locale: SEO_CONFIG.ogLocale,
      url: SEO_CONFIG.siteUrl,
      title: SEO_CONFIG.siteName,
      description: SEO_CONFIG.siteDescription,
      siteName: SEO_CONFIG.siteName,
      images: [
        {
          url: SEO_CONFIG.ogImageDefault,
          width: 1200,
          height: 630,
          alt: SEO_CONFIG.siteName,
        },
      ],
    },
    twitter: {
      card: SEO_CONFIG.twitterCardType,
      title: SEO_CONFIG.siteName,
      description: SEO_CONFIG.siteDescription,
      creator: SEO_CONFIG.twitterHandle,
      site: SEO_CONFIG.twitterHandle,
      images: [SEO_CONFIG.ogImageDefault],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
    manifest: '/manifest.json',
    themeColor: SEO_CONFIG.themeColor,
    viewport: {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 5,
    },
  };
}

/**
 * Generate page-specific metadata
 */
export function getPageMetadata(options: {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  noindex?: boolean;
  nofollow?: boolean;
  openGraph?: Partial<OpenGraph>;
  twitter?: Partial<Twitter>;
  images?: string[];
}): Metadata {
  const {
    title,
    description,
    path,
    keywords = [],
    noindex = false,
    nofollow = false,
    openGraph,
    twitter,
    images,
  } = options;
  
  const canonicalUrl = getCanonicalUrl(path);
  const og = generateOpenGraph({
    title,
    description,
    url: canonicalUrl,
    images,
    ...(openGraph && { ...openGraph, images: undefined }),
  });
  const tw = generateTwitterCard({
    title,
    description,
    images,
    ...(twitter && { ...twitter, images: undefined }),
  });
  
  return {
    title,
    description,
    keywords: [...SEO_CONFIG.primaryKeywords, ...keywords],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: og,
    twitter: tw,
    robots: {
      index: !noindex,
      follow: !nofollow,
      googleBot: {
        index: !noindex,
        follow: !nofollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

/**
 * Generate metadata for home page
 */
export function getHomeMetadata(): Metadata {
  return getPageMetadata({
    title: 'Ramadan Clock - Accurate Sehri & Iftar Times Worldwide',
    description: 'Get accurate Sehri and Iftar times for Ramadan 1446 AH. View daily schedules, download calendars, and stay on track during the holy month. Free for all Muslims worldwide.',
    path: '/',
    keywords: [
      'Ramadan times',
      'Sehri Iftar schedule',
      'Ramadan calendar',
      'Islamic fasting times',
      'prayer times Ramadan',
      'Ramadan timetable',
      'Ramadan 1446 AH',
    ],
  });
}

/**
 * Generate metadata for calendar page
 */
export function getCalendarMetadata(): Metadata {
  return getPageMetadata({
    title: 'Ramadan Calendar 1446 AH - Complete Sehri & Iftar Timetable',
    description: 'View the complete Ramadan calendar with Sehri and Iftar times for all days. Download PDF schedules and plan your fasting month ahead.',
    path: '/calendar',
    keywords: [
      'Ramadan calendar',
      'Sehri Iftar timetable',
      'Ramadan schedule',
      'Islamic calendar 1446',
      'fasting schedule',
      'Ramadan dates',
    ],
  });
}

/**
 * Generate metadata for location page (dynamic)
 */
export function getLocationMetadata(city: string): Metadata {
  const title = `Ramadan Times in ${city} - Sehri & Iftar Schedule 1446 AH`;
  const description = `Get accurate Sehri and Iftar times for ${city} during Ramadan 1446 AH. Download the complete schedule and never miss a prayer time.`;
  
  return getPageMetadata({
    title,
    description,
    path: `/location/${encodeURIComponent(city)}`,
    keywords: [
      `Ramadan times in ${city}`,
      `Sehri Iftar ${city}`,
      `prayer times ${city}`,
      `Ramadan schedule ${city}`,
      `${city} Ramadan calendar`,
      `${city} fasting times`,
    ],
  });
}

/**
 * Generate metadata for contact page
 */
export function getContactMetadata(): Metadata {
  return getPageMetadata({
    title: 'Contact - Ramadan Clock Open Source Project',
    description: 'Get in touch with the Ramadan Clock team. Learn about this open source project built with Next.js, Prisma, and PostgreSQL.',
    path: '/contact',
    keywords: [
      'Ramadan Clock contact',
      'open source Ramadan app',
      'Next.js Ramadan project',
      'Prisma PostgreSQL',
    ],
  });
}

/**
 * Generate metadata for admin pages (noindex)
 */
export function getAdminMetadata(title: string): Metadata {
  return getPageMetadata({
    title: `${title} | Admin | ${SEO_CONFIG.siteName}`,
    description: 'Admin dashboard for managing Ramadan schedules.',
    noindex: true,
    nofollow: true,
  });
}

/**
 * Generate metadata for auth pages (noindex)
 */
export function getAuthMetadata(title: string): Metadata {
  return getPageMetadata({
    title: `${title} | ${SEO_CONFIG.siteName}`,
    description: 'Secure login for admin access.',
    noindex: true,
    nofollow: true,
  });
}
