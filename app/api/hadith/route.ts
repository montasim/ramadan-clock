import { NextResponse } from "next/server";
import { getRandomHadith } from "@/lib/hadith-api";

export async function GET() {
  const hadith = await getRandomHadith();

  if (!hadith) {
    return NextResponse.json(
      { error: "Failed to fetch hadith" },
      { status: 500 }
    );
  }

  return NextResponse.json(hadith);
}
