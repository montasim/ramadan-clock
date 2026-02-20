import { getFullSchedule, getLocations, getTodayOrNextDaySchedule } from "@/actions/time-entries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { ScheduleTable } from "@/components/shared/schedule-table";
import { SehriIftarCard } from "@/components/shared/sehri-iftar-card";
import { ScheduleCard } from "@/components/shared/schedule-card";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DownloadButton } from "@/components/shared/download-button";
import LocationSkeleton from "@/components/public/location-skeleton";
import { Suspense } from "react";
import moment from 'moment';
import { getLocationMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/json-ld";
import { createWebPageSchema, createBreadcrumbSchema, createLocalBusinessSchema } from "@/lib/seo/schemas";

interface LocationPageProps {
  params: Promise<{ city: string }>;
}

// Page-level caching with ISR
// Revalidate every 30 minutes - location-specific data changes rarely
export const revalidate = 1800;
export const dynamic = 'force-static';
export const fetchCache = 'force-cache';

export async function generateMetadata({ params }: LocationPageProps) {
  const { city } = await params;
  const decodedCity = decodeURIComponent(city);
  return getLocationMetadata(decodedCity);
}

export async function generateStaticParams() {
  const locations = await getLocations();
  return locations.map((location) => ({ city: encodeURIComponent(location) }));
}

async function LocationPageContent({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const decodedCity = decodeURIComponent(city);
  const locations = await getLocations();
  if (!locations.includes(decodedCity)) notFound();

  const schedule = await getFullSchedule(decodedCity);
  const todaySchedule = await getTodayOrNextDaySchedule(decodedCity);
  const today = moment().format('YYYY-MM-DD');

  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-4 space-y-7">
      {/* Hero */}
      <div className="hero-section px-6 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 overflow-hidden">
        <div
          className="absolute -top-16 -left-16 w-48 h-48 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: "var(--grad-primary)" }}
        />
        <div className="flex items-start gap-4 relative z-10">
          <div
            className="p-3.5 rounded-2xl shadow-lg"
            style={{ background: "var(--grad-primary)" }}
          >
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] gradient-text mb1">
              Location Schedule
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
              <span className="gradient-text">{decodedCity}</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Sehri & Iftar schedule for {decodedCity}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 relative z-10">
          <Button variant="outline" asChild className="rounded-full border-border/60 bg-card/80 text-sm">
            <Link href="/calendar">← Calendar</Link>
          </Button>
          <DownloadButton
            location={decodedCity}
            type="full"
            className="border-border/60 shadow-sm bg-card/80"
          />
        </div>
      </div>

      {/* Add next day info card if iftar has passed */}
      {todaySchedule && todaySchedule.date !== today && (
        <>
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold uppercase tracking-wide text-primary">
                Next Day's Schedule
              </CardTitle>
              <CardDescription>
                Today's iftar time has passed. Showing tomorrow's schedule.
              </CardDescription>
            </CardHeader>
          </Card>
          
          {/* Main Sehri / Iftar Cards - Same design as root page */}
          <div className="grid gap-5 md:grid-cols-2">
            <SehriIftarCard
              type="sehri"
              time={todaySchedule.sehri}
              location={todaySchedule.location}
              description="End time — fast begins"
            />
            <SehriIftarCard
              type="iftar"
              time={todaySchedule.iftar}
              location={todaySchedule.location}
              description="Start time — fast breaks"
            />
          </div>
        </>
      )}

      {/* Table */}
      <ScheduleCard
        title="Schedule"
        description={`${schedule.length} entries found`}
        contentClassName="p-0"
      >
        {schedule.length > 0 ? (
          <ScheduleTable
            entries={schedule}
            showLocation={false}
            showStatus={true}
            showTodayBadge={true}
            rowClassVariant="simple"
          />
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            No entries for {decodedCity}.
          </div>
        )}
      </ScheduleCard>
    </div>
  );
}

export default async function LocationPage({ params }: LocationPageProps) {
  const { city } = await params;
  const decodedCity = decodeURIComponent(city);
  const siteUrl = process.env.NEXTAUTH_URL || 'https://ramadanclock.com';
  
  return (
    <>
      <JsonLd data={createWebPageSchema({
        name: `Ramadan Times in ${decodedCity}`,
        description: `Get accurate Sehri and Iftar times for ${decodedCity} during Ramadan 1446 AH. Download the complete schedule and never miss a prayer time.`,
        url: `${siteUrl}/location/${encodeURIComponent(decodedCity)}`,
      })} />
      <JsonLd data={createLocalBusinessSchema({
        name: `Ramadan Clock - ${decodedCity}`,
        city: decodedCity,
        description: `Sehri and Iftar times for ${decodedCity}`,
      })} />
      <JsonLd data={createBreadcrumbSchema([
        { name: 'Home', url: siteUrl },
        { name: decodedCity, url: `${siteUrl}/location/${encodeURIComponent(decodedCity)}` },
      ])} />
      <Suspense fallback={<LocationSkeleton />}>
        <LocationPageContent params={params} />
      </Suspense>
    </>
  );
}
