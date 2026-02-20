/**
 * JSON-LD Schema Generators
 * Functions for generating structured data (JSON-LD) for SEO
 */

import { SEO_CONFIG } from './constants';

/**
 * Base JSON-LD structure
 */
export interface JsonLdProps {
  '@context': string;
  '@type': string;
  [key: string]: unknown;
}

/**
 * Generate WebSite schema
 */
export function createWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SEO_CONFIG.siteName,
    url: SEO_CONFIG.siteUrl,
    description: SEO_CONFIG.siteDescription,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SEO_CONFIG.siteUrl}/calendar?location={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  } satisfies JsonLdProps;
}

/**
 * Generate Organization schema
 */
export function createOrganizationSchema(options?: {
  logo?: string;
  sameAs?: string[];
  description?: string;
}) {
  const { logo, sameAs, description } = options || {};

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SEO_CONFIG.siteName,
    url: SEO_CONFIG.siteUrl,
    logo: logo || `${SEO_CONFIG.siteUrl}/logo.png`,
    description: description || SEO_CONFIG.siteDescription,
    sameAs: sameAs || [],
  } satisfies JsonLdProps;
}

/**
 * Generate BreadcrumbList schema
 */
export function createBreadcrumbSchema(items: Array<{
  name: string;
  url: string;
}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  } satisfies JsonLdProps;
}

/**
 * Generate FAQPage schema
 */
export function createFAQSchema(faqs: Array<{
  question: string;
  answer: string;
}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  } satisfies JsonLdProps;
}

/**
 * Generate Article schema for blog posts or content pages
 */
export function createArticleSchema(options: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  image?: string;
}) {
  const { title, description, url, datePublished, dateModified, author, image } = options;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image: image || `${SEO_CONFIG.siteUrl}/og-image.png`,
    author: {
      '@type': 'Person',
      name: author || SEO_CONFIG.siteName,
    },
    publisher: {
      '@type': 'Organization',
      name: SEO_CONFIG.siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${SEO_CONFIG.siteUrl}/logo.png`,
      },
    },
    datePublished,
    dateModified: dateModified || datePublished,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  } satisfies JsonLdProps;
}

/**
 * Generate SoftwareApplication schema for the app
 */
export function createSoftwareApplicationSchema(options?: {
  applicationCategory?: string;
  operatingSystem?: string;
  offers?: {
    price: string;
    priceCurrency: string;
  };
}) {
  const { applicationCategory, operatingSystem, offers } = options || {};

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SEO_CONFIG.siteName,
    description: SEO_CONFIG.siteDescription,
    url: SEO_CONFIG.siteUrl,
    applicationCategory: applicationCategory || 'LifestyleApplication',
    operatingSystem: operatingSystem || 'Web',
    offers: offers || {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      ratingCount: '1',
    },
  } satisfies JsonLdProps;
}

/**
 * Generate LocalBusiness schema for location-specific pages
 */
export function createLocalBusinessSchema(options: {
  name: string;
  city: string;
  description?: string;
}) {
  const { name, city, description } = options;

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `${SEO_CONFIG.siteName} - ${city}`,
    description: description || `Sehri and Iftar times for ${city}`,
    url: `${SEO_CONFIG.siteUrl}/location/${encodeURIComponent(city)}`,
    areaServed: {
      '@type': 'City',
      name: city,
    },
  } satisfies JsonLdProps;
}

/**
 * Generate CollectionPage schema for listing pages
 */
export function createCollectionPageSchema(options: {
  name: string;
  description: string;
  url: string;
}) {
  const { name, description, url } = options;

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
    isPartOf: {
      '@type': 'WebSite',
      name: SEO_CONFIG.siteName,
      url: SEO_CONFIG.siteUrl,
    },
  } satisfies JsonLdProps;
}

/**
 * Generate WebPage schema
 */
export function createWebPageSchema(options: {
  name: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
}) {
  const { name, description, url, datePublished, dateModified } = options;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url,
    datePublished,
    dateModified,
    isPartOf: {
      '@type': 'WebSite',
      name: SEO_CONFIG.siteName,
      url: SEO_CONFIG.siteUrl,
    },
  } satisfies JsonLdProps;
}

/**
 * Generate Event schema for Ramadan events
 */
export function createEventSchema(options: {
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  description?: string;
  url?: string;
}) {
  const { name, startDate, endDate, location, description, url } = options;

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name,
    startDate,
    endDate,
    location: {
      '@type': 'Place',
      name: location,
    },
    description: description || `Ramadan ${SEO_CONFIG.hijriYear} event`,
    url: url || SEO_CONFIG.siteUrl,
    organizer: {
      '@type': 'Organization',
      name: SEO_CONFIG.siteName,
    },
  } satisfies JsonLdProps;
}

/**
 * Generate HowTo schema for usage instructions
 */
export function createHowToSchema(options: {
  name: string;
  description: string;
  steps: Array<{
    name: string;
    text: string;
  }>;
}) {
  const { name, description, steps } = options;

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  } satisfies JsonLdProps;
}

/**
 * Helper to convert JSON-LD schema to a script tag string
 */
export function jsonLdToString(data: JsonLdProps): string {
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}
