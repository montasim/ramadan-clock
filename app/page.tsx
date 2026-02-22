import { getScheduleDisplayData, getLocations } from "@/actions/time-entries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Moon, Sun, MapPin, CalendarDays, Quote } from "lucide-react";
import { LocationSelector } from "@/components/shared/location-selector";
import { PageHero } from "@/components/shared/page-hero";
import Link from "next/link";
import { Suspense } from "react";
import TodayScheduleSkeleton from "@/components/public/today-schedule-skeleton";
import { DownloadButton } from "@/components/shared/download-button";
import { getRandomHadith } from "@/lib/hadith-api";
import { CountdownTimer } from "@/components/shared/countdown-timer";
import moment from 'moment-timezone';
import { getHomeMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/json-ld";
import { createWebPageSchema, createBreadcrumbSchema, createSoftwareApplicationSchema } from "@/lib/seo/schemas";
import { APP_CONFIG } from "@/lib/config/index";
import { config } from "@/lib/config";

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
  const timezone = config.timezone;
  const today = moment().tz(timezone).format('YYYY-MM-DD');
  const todayDisplay = moment().tz(timezone).format("dddd, MMMM D, YYYY");

  return (
    <div className="space-y-7">
      {/* ── Hero Banner ─────────────────────── */}
      <PageHero
        subtitle="✦ Ramadan 1446 AH"
        title={
          <>
            {scheduleData.iftarPassed ? "Tomorrow's" : "Today's"}{" "}
            <span className="gradient-text">Schedule</span>
          </>
        }
        description={todayDisplay}
        actions={
          <>
            <LocationSelector locations={locations} currentLocation={location} />
            <DownloadButton
              location={selectedLocation}
              type="today"
              className="border-border/60 shadow-sm bg-card/80"
            />
          </>
        }
        orbOpacity={20}
      />
      
      {/* ── Sehri / Iftar Cards ─────────────── */}
      {(() => {
        // Determine which schedule to display on main cards
        const displaySchedule = scheduleData.iftarPassed ? scheduleData.tomorrow : scheduleData.today;
        
        if (!displaySchedule) {
          return (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-14 text-center backdrop-blur-sm">
              <div
                className="mx-auto mb-4 inline-flex p-4 rounded-2xl"
                style={{ background: "linear-gradient(135deg,rgba(59,130,246,.12),rgba(168,85,247,.12))" }}
              >
                <Clock className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-lg font-bold">No Schedule Available</h3>
              <p className="text-muted-foreground text-sm mt-1">
                {scheduleData.iftarPassed ? "Tomorrow's schedule has not been uploaded yet." : "Today's schedule has not been uploaded yet."}
              </p>
            </div>
          );
        }

        return (
          <div className="grid gap-5 md:grid-cols-2">
            {/* Sehri */}
            <div className={`relative overflow-hidden rounded-2xl p-6 shadow-sm ${
              scheduleData.sehriPassed && !scheduleData.iftarPassed
                ? 'card-sehri-passed opacity-60'
                : 'card-sehri'
            }`}>
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Sun className="h-32 w-32 text-amber-500" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-amber-500/15 shadow-inner">
                  <Sun className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
                    Sehri
                  </p>
                  <p className="text-xs text-amber-600/60 dark:text-amber-500/60">
                    {scheduleData.sehriPassed && !scheduleData.iftarPassed
                      ? 'Passed — fast has begun'
                      : 'End time — fast begins'}
                  </p>
                </div>
              </div>
              <div className="text-5xl font-bold text-amber-900 dark:text-amber-100 tracking-tight">
                {displaySchedule.sehri}
              </div>
              {!scheduleData.sehriPassed && (
                <CountdownTimer
                  targetTime={(displaySchedule as any).sehri24 || displaySchedule.sehri}
                  className="mt-3 text-amber-700 dark:text-amber-400"
                />
              )}
              {displaySchedule.location && (
                <p className="text-xs text-amber-700/60 dark:text-amber-400/60 mt-3 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />{displaySchedule.location}
                </p>
              )}
            </div>

            {/* Iftar */}
            <div className="relative overflow-hidden rounded-2xl card-iftar p-6 shadow-sm">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Moon className="h-32 w-32 text-violet-500" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-violet-500/15 shadow-inner">
                  <Moon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-violet-700 dark:text-violet-400">
                    Iftar
                  </p>
                  <p className="text-xs text-violet-600/60 dark:text-violet-500/60">
                    Start time — fast breaks
                  </p>
                </div>
              </div>
              <div className="text-5xl font-bold text-violet-900 dark:text-violet-100 tracking-tight">
                {displaySchedule.iftar}
              </div>
              {!scheduleData.iftarPassed && (
                <CountdownTimer
                  targetTime={(displaySchedule as any).iftar24 || displaySchedule.iftar}
                  className="mt-3 text-violet-700 dark:text-violet-400"
                />
              )}
              {displaySchedule.location && (
                <p className="text-xs text-violet-700/60 dark:text-violet-400/60 mt-3 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />{displaySchedule.location}
                </p>
              )}
            </div>
          </div>
        );
      })()}

      {/* Add today's passed schedule card if iftar has passed */}
      {scheduleData.iftarPassed && scheduleData.today && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-wide text-primary">
              Today's Passed Schedule
            </CardTitle>
            <CardDescription>
              Today's sehri and iftar time have passed. View today's schedule.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <div className="flex-1">
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">Sehri</p>
              <p className="text-lg font-semibold">{scheduleData.today.sehri}</p>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-violet-600 dark:text-violet-400 mb-1">Iftar</p>
              <p className="text-lg font-semibold">{scheduleData.today.iftar}</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* ── Hadith of the Day ─────────────────────── */}
      {hadith && (
        <Card className="border-primary/30 overflow-hidden shadow-sm bg-primary/5 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Quote className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-bold uppercase tracking-wide text-primary">
                Hadith of the Day
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-base leading-relaxed text-foreground/90 italic">
              "{hadith.text}"
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-px flex-1 bg-border/40" />
              <span className="font-medium text-primary/80">— {hadith.source}</span>
              <div className="h-px flex-1 bg-border/40" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Quick Links ─────────────────────── */}
      <Card className="border-primary/30 overflow-hidden shadow-sm bg-primary/5 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold uppercase tracking-wide text-primary">
            Quick Links
          </CardTitle>
          <CardDescription>Navigate to other sections</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {locations.map((loc) => (
            <Button
              key={loc}
              variant="outline"
              asChild
              className="rounded-full border-border/60 text-sm hover:border-primary/50 hover:text-primary transition-colors"
            >
              <Link href={`/calendar?location=${encodeURIComponent(loc)}`}>
                <MapPin className="h-3.5 w-3.5 mr-1.5" />
                {loc}
              </Link>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
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
