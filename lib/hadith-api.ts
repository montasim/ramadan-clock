// Hadith API - Free public API from hadithapi.pages.dev
// Documentation: https://github.com/hadithapi/hadithapi

interface HadithResponse {
  id: number;
  header: string;
  hadith_english: string;
  book: string;
  refno: string;
  bookName: string;
  chapterName: string;
}

interface SearchResponse {
  results: HadithResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Available collections
const COLLECTIONS = ['bukhari', 'muslim', 'abudawud', 'tirmidhi', 'nasai', 'ibnmajah'] as const;
type Collection = typeof COLLECTIONS[number];

// Fetch a specific hadith by collection and ID
export async function getHadith(collection: Collection, id: number): Promise<HadithResponse> {
  const response = await fetch(
    `https://hadithapi.pages.dev/api/${collection}/${id}`
  );
  return await response.json();
}

// Search for hadiths by query
export async function searchHadiths(
  query: string,
  collection: Collection | '' = ''
): Promise<SearchResponse> {
  const url = new URL('https://hadithapi.pages.dev/api/search');
  url.searchParams.append('q', query);
  if (collection) url.searchParams.append('collection', collection);

  const response = await fetch(url);
  const data = await response.json();
  return data;
}

// Get a random hadith from a collection
export async function getRandomHadith(): Promise<{ text: string; source: string } | null> {
  try {
    // Randomly select a collection
    const collection = COLLECTIONS[Math.floor(Math.random() * COLLECTIONS.length)];
    
    // Generate a random ID (Bukhari has ~7563 hadiths, Muslim has ~7500, etc.)
    // We'll use a reasonable range that should work for most collections
    const randomId = Math.floor(Math.random() * 7000) + 1;
    
    const response = await fetch(
      `https://hadithapi.pages.dev/api/${collection}/${randomId}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch hadith: ${response.status}`);
    }

    const data: HadithResponse = await response.json();

    // Clean up the hadith text
    const cleanText = data.hadith_english
      .replace(/\s+/g, ' ')
      .trim();

    return {
      text: cleanText,
      source: `${data.book} - ${data.refno}`,
    };
  } catch (error) {
    console.error('Error fetching hadith:', error);
    
    // Return a fallback hadith if API fails
    return {
      text: "The Prophet (ﷺ) said: 'The most complete believer in faith is the one with the best character, and the best of you are the best in behavior to their women.'",
      source: "At-Tirmidhi 1162",
    };
  }
}
