import { config } from "./config";

interface HadithResponse {
  data: {
    hadith_english: string;
    hadith_source: string;
    book: {
      bookName: string;
    };
  }[];
}

export async function getRandomHadith(): Promise<{ text: string; source: string } | null> {
  try {
    // Using Hadith API (https://hadithapi.com)
    // For free tier, we can use public collections without API key
    const apiKey = config.hadithApiKey || "free";
    const response = await fetch(
      `https://hadithapi.com/api/hadiths?apiKey=${apiKey}&paginate=10&random=true`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) {
      throw new Error('Failed to fetch hadith');
    }

    const data: HadithResponse = await response.json();

    if (data.data && data.data.length > 0) {
      const hadith = data.data[0];
      return {
        text: hadith.hadith_english,
        source: `${hadith.book.bookName} - ${hadith.hadith_source}`,
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching hadith:', error);
    return null;
  }
}
