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
    // Pick a random collection and a random hadith ID
    const collection = COLLECTIONS[Math.floor(Math.random() * COLLECTIONS.length)];
    const randomId = Math.floor(Math.random() * 1000) + 1; // Random ID between 1 and 1000
    
    const response = await fetch(
      `https://hadithapi.pages.dev/api/${collection}/${randomId}`
    );
    
    if (!response.ok) {
      return null;
    }
    
    const data: HadithResponse = await response.json();
    
    return {
      text: data.hadith_english,
      source: `${data.bookName} - ${data.refno}`
    };
  } catch (error) {
    console.error('Error fetching random hadith:', error);
    return null;
  }
}
