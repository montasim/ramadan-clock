import { getFullSchedule, getLocations, getTodayOrNextDaySchedule } from "@/actions/time-entries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarDays, MapPin } from "lucide-react";
import { Suspense } from "react";
import CalendarSkeleton from "@/components/public/calendar-skeleton";
import { DownloadButton } from "@/components/shared/download-button";

async function CalendarContent({ searchParams }: { searchParams: Promise<{ location?: string }> }) {
  const { location } = await searchParams;
  const schedule = await getFullSchedule(location || null);
  const locations = await getLocations();
  const todaySchedule = await getTodayOrNextDaySchedule(location || null);
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-7">
      {/* Hero */}
      <div className="hero-section px-6 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 overflow-hidden">
        <div
          className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: "var(--grad-primary)" }}
        />
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] gradient-text mb-2">
            <CalendarDays className="inline h-3.5 w-3.5 mr-1" />
            Full Schedule
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
            Ramadan <span className="gradient-text">Calendar</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-2">Complete Sehri &amp; Iftar timetable</p>
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
          <DownloadButton
            location={location}
            type="full"
            className="border-border/60 shadow-sm bg-card/80"
          />
        </div>
      </div>

      {/* Add next day info card if iftar has passed */}
      {todaySchedule && todaySchedule.date !== today && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-wide text-primary">
              Next Day's Schedule
            </CardTitle>
            <CardDescription>
              Today's iftar time has passed. Showing tomorrow's schedule.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <div className="flex-1">
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">Sehri</p>
              <p className="text-lg font-semibold">{todaySchedule.sehri}</p>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-violet-600 dark:text-violet-400 mb-1">Iftar</p>
              <p className="text-lg font-semibold">{todaySchedule.iftar}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table Card */}
      <Card className="border-border/60 overflow-hidden shadow-sm bg-card/70 backdrop-blur-sm">
        <div className="h-[2px] w-full" style={{ background: "var(--grad-primary)" }} />
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Schedule Table
          </CardTitle>
          <CardDescription>
            {schedule.length} entries {location ? `for ${location}` : "across all locations"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {schedule.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="pl-4 sm:pl-6 w-[140px] sm:w-[180px]">Date</TableHead>
                    <TableHead className="px-2 sm:px-4">Sehri</TableHead>
                    <TableHead className="px-2 sm:px-4">Iftar</TableHead>
                    <TableHead className="px-2 sm:px-4">Location</TableHead>
                    <TableHead className="text-center pr-4 sm:pr-6 hidden md:table-cell">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedule.map((entry) => {
                    const isToday = entry.date === today;
                    const isPast = new Date(entry.date) < new Date(today);
                    return (
                      <TableRow
                        key={entry.id}
                        className={
                          isToday
                            ? "bg-blue-500/6 border-blue-500/20"
                            : "hover:bg-primary/4 border-border/40"
                        }
                      >
                        <TableCell className="font-medium pl-4 sm:pl-6 py-3 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-xs sm:text-sm">
                              {new Date(entry.date).toLocaleDateString("en-US", {
                                month: "short", day: "numeric", year: "numeric",
                              })}
                            </span>
                            {isToday && (
                              <span
                                className="w-fit text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded-full text-white font-bold mt-1"
                                style={{ background: "var(--grad-primary)" }}
                              >
                                TODAY
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-amber-600 dark:text-amber-400 px-2 sm:px-4">
                          {entry.sehri}
                        </TableCell>
                        <TableCell className="font-semibold text-violet-600 dark:text-violet-400 px-2 sm:px-4">
                          {entry.iftar}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs sm:text-sm px-2 sm:px-4">{entry.location || "—"}</TableCell>
                        <TableCell className="text-center pr-4 sm:pr-6 hidden md:table-cell">
                          {isPast ? (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Past</Badge>
                          ) : isToday ? (
                            <Badge className="text-[10px] px-1.5 py-0 bg-primary/20 text-primary hover:bg-primary/30 border-primary/30">Today</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/40 text-primary">Upcoming</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">No schedule entries found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ location?: string }> }) {
  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-4">
      <Suspense fallback={<CalendarSkeleton />}>
        <CalendarContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
