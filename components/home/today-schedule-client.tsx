/**
 * TodayScheduleClient Component
 * Client-side component that handles time status calculation to avoid caching issues
 * This ensures real-time updates when sehri/iftar times pass
 */

'use client';

import { useTimeStatus } from '@/hooks/use-time-status';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, MapPin } from "lucide-react";
import { CountdownTimer } from "@/components/shared/countdown-timer";
import { LocationSelector } from "@/components/shared/location-selector";
import { DownloadButton } from "@/components/shared/download-button";
import moment from 'moment-timezone';
import { config } from '@/lib/config';
import { TimeEntry } from '@/lib/db';
import { useSearchParams } from 'next/navigation';

interface TodayScheduleClientProps {
  today: (TimeEntry & { sehri24: string; iftar24: string }) | null;
  tomorrow: (TimeEntry & { sehri24: string; iftar24: string }) | null;
  locations: string[];
  hadith: { text: string; source: string } | null;
}

export function TodayScheduleClient({ today, tomorrow, locations, hadith }: TodayScheduleClientProps) {
  // Get current location from search params
  const searchParams = useSearchParams();
  const location = searchParams.get('location');
  const selectedLocation = location || "Rangpur";

  // Calculate time status on client-side to avoid caching issues
  const { sehriPassed, iftarPassed } = useTimeStatus({
    sehri: today?.sehri24 || today?.sehri,
    iftar: today?.iftar24 || today?.iftar,
  });

  // Determine which schedule to display
  const displaySchedule = iftarPassed ? tomorrow : today;

  // Calculate display date
  const displayDate = iftarPassed
    ? moment().add(1, 'day').tz(config.timezone).format("dddd, MMMM D, YYYY")
    : moment().tz(config.timezone).format("dddd, MMMM D, YYYY");

  return (
    <div className="space-y-7">
      {/* ── Hero Banner ─────────────────────── */}
      <div className="hero-section px-6 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 relative overflow-hidden">
        {/* Decorative mini orb inside hero */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
            ✦ Ramadan 1446 AH
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {iftarPassed ? "Tomorrow's" : "Today's"}{" "}
            <span className="gradient-text">Schedule</span>
          </h1>
          <p className="text-muted-foreground text-sm">{displayDate}</p>
        </div>

        {/* Location selector and download button */}
        <div className="flex items-center gap-2 shrink-0 relative z-10">
          <LocationSelector locations={locations} currentLocation={location || undefined} />
          <DownloadButton
            location={selectedLocation}
            type="today"
            className="border-border/60 shadow-sm bg-card/80"
          />
        </div>
      </div>

      {/* ── Sehri / Iftar Cards ─────────────── */}
      {(() => {
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
                {iftarPassed ? "Tomorrow's schedule has not been uploaded yet." : "Today's schedule has not been uploaded yet."}
              </p>
            </div>
          );
        }

        return (
          <div className="grid gap-5 md:grid-cols-2">
            {/* Sehri */}
            <div className={`relative overflow-hidden rounded-2xl p-6 shadow-sm ${
              sehriPassed && !iftarPassed
                ? 'card-sehri-passed opacity-60'
                : 'card-sehri'
            }`}>
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <svg className="h-32 w-32 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm1-13h-2v6l5.25 3.15.75-1.23-4-2.37z" />
                </svg>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-amber-500/15 shadow-inner">
                  <svg className="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
                    Sehri
                  </p>
                  <p className="text-xs text-amber-600/60 dark:text-amber-500/60">
                    {sehriPassed && !iftarPassed
                      ? 'Passed — fast has begun'
                      : 'End time — fast begins'}
                  </p>
                </div>
              </div>
              <div className="text-5xl font-bold text-amber-900 dark:text-amber-100 tracking-tight">
                {displaySchedule.sehri}
              </div>
              {!sehriPassed && (
                <CountdownTimer
                  targetTime={displaySchedule.sehri24 || displaySchedule.sehri}
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
                <svg className="h-32 w-32 text-violet-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm1-13h-2v6l5.25 3.15.75-1.23-4-2.37z" />
                </svg>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-violet-500/15 shadow-inner">
                  <svg className="h-5 w-5 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
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
              {!iftarPassed && (
                <CountdownTimer
                  targetTime={displaySchedule.iftar24 || displaySchedule.iftar}
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
      {iftarPassed && today && (
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
              <p className="text-lg font-semibold">{today.sehri}</p>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-violet-600 dark:text-violet-400 mb-1">Iftar</p>
              <p className="text-lg font-semibold">{today.iftar}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Hadith of the Day ─────────────────────── */}
      {hadith && (
        <Card className="border-primary/30 overflow-hidden shadow-sm bg-primary/5 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21L14.017 18C14.017 16.896 14.321 16.067 14.929 15.512C15.536 14.957 16.479 14.679 17.758 14.679L18.994 14.679L18.994 12.332L17.758 12.332C16.479 12.332 15.536 12.054 14.929 11.499C14.321 10.944 14.017 10.115 14.017 9.011L14.017 6C14.017 4.896 13.713 4.067 13.105 3.512C12.498 2.957 11.555 2.679 10.276 2.679L9.04 2.679L9.04 5.026L10.276 5.026C11.555 5.026 12.498 5.304 13.105 5.859C13.713 6.414 14.017 7.243 14.017 8.347L14.017 11.358C14.017 12.462 14.321 13.291 14.929 13.846C15.536 14.401 16.479 14.679 17.758 14.679L18.994 14.679L18.994 17.026L17.758 17.026C16.479 17.026 15.536 17.304 14.929 17.859C14.321 18.414 14.017 19.243 14.017 20.347L14.017 21Z" />
              </svg>
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
            <button
              key={loc}
              onClick={() => window.location.href = `/calendar?location=${encodeURIComponent(loc)}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border/60 text-sm hover:border-primary/50 hover:text-primary transition-colors"
            >
              <MapPin className="h-3.5 w-3.5" />
              {loc}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* ── API Attribution ─────────────────────── */}
      <Card className="border-primary/30 overflow-hidden shadow-sm bg-primary/5 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold uppercase tracking-wide text-primary">
            Prayer Times Data Source
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            This application uses the <strong>Aladhan API</strong> for prayer times.
            The Aladhan API is responsible for providing all prayer time data displayed on this platform.
          </p>
          <a
            href="https://aladhan.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            Learn more about Aladhan API →
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
