import { getTodaySchedule, getLocations } from "@/actions/time-entries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Moon, Sun, MapPin } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import TodayScheduleSkeleton from "@/components/public/today-schedule-skeleton";
import { DownloadButton } from "@/components/shared/download-button";

async function TodayScheduleContent({ searchParams }: { searchParams: Promise<{ location?: string }> }) {
  const { location } = await searchParams;
  const todaySchedule = await getTodaySchedule(location || null);
  const locations = await getLocations();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8">
      {/* ── Hero Banner ─────────────────────────── */}
      <div className="hero-section rounded-2xl px-6 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🌙</span>
            <span className="text-sm font-semibold uppercase tracking-widest gradient-text">
              Ramadan 1446 AH
            </span>
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-1">Today&apos;s Schedule</h1>
          <p className="text-muted-foreground text-sm">{today}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Select defaultValue={location || "all"}>
            <SelectTrigger className="w-[200px] bg-background/70 backdrop-blur border-border/60">
              <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" asChild className="border-border/60 bg-background/70 backdrop-blur">
            <DownloadButton location={location} type="today" />
          </Button>
        </div>
      </div>

      {/* ── Sehri / Iftar Cards ─────────────────── */}
      {todaySchedule ? (
        <div className="grid gap-5 md:grid-cols-2">
          {/* Sehri */}
          <div className="relative overflow-hidden rounded-2xl card-sehri p-6 shadow-sm">
            {/* Big decorative icon */}
            <div className="absolute top-3 right-3 opacity-15">
              <Sun className="h-28 w-28 text-amber-500" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-amber-500/20 rounded-xl">
                  <Sun className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">Sehri</p>
                  <p className="text-xs text-amber-600/70 dark:text-amber-500/70">End time — fast begins</p>
                </div>
              </div>
              <div className="text-5xl font-bold text-amber-900 dark:text-amber-200 tracking-tight">
                {todaySchedule.sehri}
              </div>
              {todaySchedule.location && (
                <p className="text-sm text-amber-700/70 dark:text-amber-400/70 mt-3 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {todaySchedule.location}
                </p>
              )}
            </div>
          </div>

          {/* Iftar */}
          <div className="relative overflow-hidden rounded-2xl card-iftar p-6 shadow-sm">
            <div className="absolute top-3 right-3 opacity-15">
              <Moon className="h-28 w-28 text-indigo-500" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-indigo-500/20 rounded-xl">
                  <Moon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-indigo-700 dark:text-indigo-400">Iftar</p>
                  <p className="text-xs text-indigo-600/70 dark:text-indigo-500/70">Start time — fast breaks</p>
                </div>
              </div>
              <div className="text-5xl font-bold text-indigo-900 dark:text-indigo-200 tracking-tight">
                {todaySchedule.iftar}
              </div>
              {todaySchedule.location && (
                <p className="text-sm text-indigo-700/70 dark:text-indigo-400/70 mt-3 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {todaySchedule.location}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <div className="mx-auto mb-4 p-4 rounded-full inline-flex" style={{ background: "var(--grad-hero)" }}>
            <Clock className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="mt-2 text-lg font-semibold">No Schedule Available</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Today&apos;s schedule has not been uploaded yet.
          </p>
        </div>
      )}

      {/* ── Quick Links ─────────────────────────── */}
      <Card className="border-border/60 overflow-hidden">
        <div className="h-1 w-full" style={{ background: "var(--grad-primary)" }} />
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Links</CardTitle>
          <CardDescription>Navigate to other sections</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild className="btn-gradient rounded-full">
            <Link href="/calendar">View Full Calendar</Link>
          </Button>
          {locations.map((loc) => (
            <Button key={loc} variant="outline" asChild className="rounded-full border-border/60 hover:border-primary/40">
              <Link href={`/location/${encodeURIComponent(loc)}`}>
                <MapPin className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
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
    <div className="w-full max-w-5xl mx-auto py-10 px-4 space-y-6">
      <Suspense fallback={<TodayScheduleSkeleton />}>
        <TodayScheduleContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
