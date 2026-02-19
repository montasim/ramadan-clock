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
    <div className="space-y-7">
      {/* ── Hero Banner ─────────────────────── */}
      <div className="hero-section px-6 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        {/* Decorative mini orbs inside hero */}
        <div
          className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: "var(--grad-primary)" }}
        />
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] gradient-text mb-2">
            ✦ Ramadan 1446 AH
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
            Today&apos;s{" "}
            <span className="gradient-text">Schedule</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-2">{today}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0 relative z-10">
          <Select defaultValue={location || "all"}>
            <SelectTrigger className="w-[200px] bg-card/80 backdrop-blur border-border/60 shadow-sm">
              <MapPin className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" asChild className="border-border/60 shadow-sm bg-card/80">
            <DownloadButton location={location} type="today" />
          </Button>
        </div>
      </div>

      {/* ── Sehri / Iftar Cards ─────────────── */}
      {todaySchedule ? (
        <div className="grid gap-5 md:grid-cols-2">
          {/* Sehri */}
          <div className="relative overflow-hidden rounded-2xl card-sehri p-6 shadow-sm">
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
                <p className="text-xs text-amber-600/60 dark:text-amber-500/60">End time — fast begins</p>
              </div>
            </div>
            <div className="text-5xl font-bold text-amber-900 dark:text-amber-100 tracking-tight">
              {todaySchedule.sehri}
            </div>
            {todaySchedule.location && (
              <p className="text-xs text-amber-700/60 dark:text-amber-400/60 mt-3 flex items-center gap-1">
                <MapPin className="h-3 w-3" />{todaySchedule.location}
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
                <p className="text-xs text-violet-600/60 dark:text-violet-500/60">Start time — fast breaks</p>
              </div>
            </div>
            <div className="text-5xl font-bold text-violet-900 dark:text-violet-100 tracking-tight">
              {todaySchedule.iftar}
            </div>
            {todaySchedule.location && (
              <p className="text-xs text-violet-700/60 dark:text-violet-400/60 mt-3 flex items-center gap-1">
                <MapPin className="h-3 w-3" />{todaySchedule.location}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-14 text-center backdrop-blur-sm">
          <div
            className="mx-auto mb-4 inline-flex p-4 rounded-2xl"
            style={{ background: "linear-gradient(135deg,rgba(59,130,246,.12),rgba(168,85,247,.12))" }}
          >
            <Clock className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-lg font-bold">No Schedule Available</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Today&apos;s schedule has not been uploaded yet.
          </p>
        </div>
      )}

      {/* ── Quick Links ─────────────────────── */}
      <Card className="border-border/60 overflow-hidden shadow-sm bg-card/70 backdrop-blur-sm">
        <div className="h-[2px] w-full" style={{ background: "var(--grad-primary)" }} />
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Quick Links
          </CardTitle>
          <CardDescription>Navigate to other sections</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild className="btn-gradient rounded-full font-semibold">
            <Link href="/calendar">📅 Full Calendar</Link>
          </Button>
          {locations.map((loc) => (
            <Button
              key={loc}
              variant="outline"
              asChild
              className="rounded-full border-border/60 text-sm hover:border-primary/50 hover:text-primary transition-colors"
            >
              <Link href={`/location/${encodeURIComponent(loc)}`}>
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
    <div className="w-full max-w-5xl mx-auto py-10 px-4 space-y-6">
      <Suspense fallback={<TodayScheduleSkeleton />}>
        <TodayScheduleContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
