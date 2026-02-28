import { getScheduleDisplayData, getLocations } from "@/actions/time-entries";
import { Suspense } from "react";
import TodayScheduleSkeleton from "@/components/public/today-schedule-skeleton";
import { getRandomHadith } from "@/lib/hadith-api";
import { getHomeMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/json-ld";
import { createWebPageSchema, createBreadcrumbSchema, createSoftwareApplicationSchema } from "@/lib/seo/schemas";
import { TodayScheduleClient } from "@/components/home/today-schedule-client";

export const metadata = getHomeMetadata();

// Page-level caching with ISR
// Revalidate every 5 minutes to ensure fresh data while improving performance
export const revalidate = 300;

async function TodayScheduleContent({ searchParams }: { searchParams: Promise<{ location?: string }> }) {
  const { location } = await searchParams;
  const selectedLocation = location || "Rangpur"; // Default to Rangpur
  const scheduleData = await getScheduleDisplayData(selectedLocation);
  const locations = await getLocations();
  const hadith = await getRandomHadith();

  return (
    <TodayScheduleClient
      today={scheduleData.today}
      tomorrow={scheduleData.tomorrow}
      locations={locations}
      hadith={hadith}
    />
  );
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ location?: string }> }) {
  return (
    <>
      <JsonLd data={createWebPageSchema({
        name: 'Ramadan Clock - Your Complete Sehri & Iftar Schedule',
        description: 'Get accurate Sehri and Iftar times for Ramadan 1446 AH. View daily schedules, download calendars, and stay on track during the holy month. Free for all Muslims worldwide.',
        url: process.env.NEXTAUTH_URL || 'https://ramadanclock.com',
      })} />
      <JsonLd data={createBreadcrumbSchema([
        { name: 'Home', url: process.env.NEXTAUTH_URL || 'https://ramadanclock.com' },
      ])} />
      <JsonLd data={createSoftwareApplicationSchema()} />
      <div className="w-full max-w-5xl mx-auto py-10 px-4 space-y-6">
        <Suspense fallback={<TodayScheduleSkeleton />}>
          <TodayScheduleContent searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}
