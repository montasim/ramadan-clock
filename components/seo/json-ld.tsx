/**
 * JSON-LD Schema Component
 * React component for injecting JSON-LD structured data into the page
 */

import { type JsonLdProps } from '@/lib/seo/schemas';

export function JsonLd({ data }: { data: JsonLdProps }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
