import { getFullSchedule, getLocations, getTodayOrNextDaySchedule } from "@/actions/time-entries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import { PageHero } from "@/components/shared/page-hero";
import { Suspense } from "react";
import CalendarSkeleton from "@/components/public/calendar-skeleton";
import { DownloadButton } from "@/components/shared/download-button";
import { SehriIftarCard } from "@/components/shared/sehri-iftar-card";
import { ScheduleTable } from "@/components/shared/schedule-table";
import { ScheduleCard } from "@/components/shared/schedule-card";
import { LocationSelector } from "@/components/shared/location-selector";
import moment from 'moment-timezone';
import { getCalendarMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/json-ld";
import { createWebPageSchema, createBreadcrumbSchema, createCollectionPageSchema } from "@/lib/seo/schemas";
import { APP_CONFIG } from "@/lib/config/index";
import { config } from "@/lib/config";

export const metadata = getCalendarMetadata();

// Page-level caching with ISR
// Revalidate every 15 minutes - calendar data changes rarely
export const revalidate = 900;

async function CalendarContent({ searchParams }: { searchParams: Promise<{ location?: string }> }) {
  const { location } = await searchParams;
  const selectedLocation = location || "Rangpur"; // Default to Rangpur
  const schedule = await getFullSchedule(selectedLocation);
  const locations = await getLocations();
  const todaySchedule = await getTodayOrNextDaySchedule(selectedLocation);
  const today = moment().tz(config.timezone).format('YYYY-MM-DD');

  return (
    <div className="space-y-7">
      {/* Hero */}
      <PageHero
        subtitle={
          <>
            <CalendarDays className="inline h-3.5 w-3.5 mr-1" />
            Full Schedule
          </>
        }
        title={
          location ? (
            <span className="gradient-text">{selectedLocation}</span>
          ) : (
            <>
              Ramadan <span className="gradient-text">Calendar</span>
            </>
          )
        }
        description={
          location
            ? `Sehri & Iftar schedule for ${selectedLocation}`
            : "Complete Sehri & Iftar timetable"
        }
        actions={
          <>
            <LocationSelector locations={locations} currentLocation={location} />
            <DownloadButton
              location={selectedLocation}
              type="full"
              className="border-border/60 shadow-sm bg-card/80"
            />
          </>
        }
      />

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

      {/* Table Card */}
      <ScheduleCard
        title="Schedule Table"
        description={`${schedule.length} entries ${location ? `for ${location}` : "across all locations"}`}
        contentClassName="p-0"
      >
        {schedule.length > 0 ? (
          <ScheduleTable
            entries={schedule}
            showLocation={true}
            showStatus={true}
            showTodayBadge={true}
            rowClassVariant="full"
          />
        ) : (
          <div className="text-center py-16 text-muted-foreground">No schedule entries found.</div>
        )}
      </ScheduleCard>
    </div>
  );
}

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ location?: string }> }) {
  const siteUrl = process.env.NEXTAUTH_URL || 'https://ramadanclock.com';
  
  return (
    <>
      <JsonLd data={createCollectionPageSchema({
        name: 'Ramadan Calendar 1446 AH',
        description: 'View the complete Ramadan calendar with Sehri and Iftar times for all days. Download PDF schedules and plan your fasting month ahead.',
        url: `${siteUrl}/calendar`,
      })} />
      <JsonLd data={createWebPageSchema({
        name: 'Ramadan Calendar 1446 AH',
        description: 'View the complete Ramadan calendar with Sehri and Iftar times for all days. Download PDF schedules and plan your fasting month ahead.',
        url: `${siteUrl}/calendar`,
      })} />
      <JsonLd data={createBreadcrumbSchema([
        { name: 'Home', url: siteUrl },
        { name: 'Calendar', url: `${siteUrl}/calendar` },
      ])} />
      <div className="w-full max-w-5xl mx-auto py-10 px-4">
        <Suspense fallback={<CalendarSkeleton />}>
          <CalendarContent searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}
