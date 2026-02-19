import { getFullSchedule, getLocations } from "@/actions/time-entries";
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
          <Button variant="outline" size="icon" asChild className="border-border/60 shadow-sm bg-card/80">
            <DownloadButton location={location} type="full" />
          </Button>
        </div>
      </div>

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
                    <TableHead className="pl-6 w-[180px]">Date</TableHead>
                    <TableHead>Sehri</TableHead>
                    <TableHead>Iftar</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-center pr-6">Status</TableHead>
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
                        <TableCell className="font-medium pl-6">
                          {new Date(entry.date).toLocaleDateString("en-US", {
                            weekday: "short", month: "short", day: "numeric", year: "numeric",
                          })}
                          {isToday && (
                            <span
                              className="ml-2 text-[10px] px-2 py-0.5 rounded-full text-white font-bold"
                              style={{ background: "var(--grad-primary)" }}
                            >
                              TODAY
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="font-semibold text-amber-600 dark:text-amber-400">
                          {entry.sehri}
                        </TableCell>
                        <TableCell className="font-semibold text-violet-600 dark:text-violet-400">
                          {entry.iftar}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{entry.location || "—"}</TableCell>
                        <TableCell className="text-center pr-6">
                          {isPast ? (
                            <Badge variant="secondary" className="text-xs">Past</Badge>
                          ) : isToday ? (
                            <span
                              className="text-[10px] px-2.5 py-1 rounded-full text-white font-bold"
                              style={{ background: "var(--grad-primary)" }}
                            >
                              Today
                            </span>
                          ) : (
                            <Badge variant="outline" className="text-xs border-primary/40 text-primary font-medium">
                              Upcoming
                            </Badge>
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
