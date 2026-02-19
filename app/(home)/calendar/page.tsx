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
import { CalendarDays, MapPin, Sun, Moon } from "lucide-react";
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
          <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
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
                  <p className="text-xs text-amber-600/60 dark:text-amber-500/60">
                    End time — fast begins
                  </p>
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
                  <p className="text-xs text-violet-600/60 dark:text-violet-500/60">
                    Start time — fast breaks
                  </p>
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
        </>
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
                    const entryDate = new Date(entry.date);
                    const todayDate = new Date(today);
                    
                    // Parse sehri and iftar times
                    const parseTime = (timeStr: string) => {
                      const [hours, minutes] = timeStr.split(':').map(Number);
                      return { hours, minutes };
                    };
                    
                    const sehriTime = parseTime(entry.sehri);
                    const iftarTime = parseTime(entry.iftar);
                    
                    // Get current time in Asia/Dhaka timezone
                    const now = new Date();
                    const currentHours = now.getHours();
                    const currentMinutes = now.getMinutes();
                    
                    // Check if current time is past a given time
                    const isTimePast = (hours: number, minutes: number) => {
                      return currentHours > hours || (currentHours === hours && currentMinutes >= minutes);
                    };
                    
                    // Determine status based on time
                    let status: "passed" | "today" | "tomorrow" | "upcoming";
                    let statusText: string;
                    let rowClass: string;
                    
                    if (entryDate < todayDate) {
                      // Past dates are always passed
                      status = "passed";
                      statusText = "Passed";
                      rowClass = "bg-red-500/10 border-red-500/30";
                    } else if (isToday) {
                      // Today: check if iftar time has passed
                      if (isTimePast(iftarTime.hours, iftarTime.minutes)) {
                        status = "passed";
                        statusText = "Passed";
                        rowClass = "bg-red-500/10 border-red-500/30";
                      } else {
                        status = "today";
                        statusText = "Today";
                        rowClass = "bg-blue-500/6 border-blue-500/20";
                      }
                    } else {
                      // Future dates: check if it's tomorrow
                      const tomorrowDate = new Date(todayDate);
                      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
                      const isTomorrow = entryDate.getTime() === tomorrowDate.getTime();
                      
                      if (isTomorrow) {
                        // Tomorrow: check if sehri time has passed
                        if (isTimePast(sehriTime.hours, sehriTime.minutes)) {
                          status = "today";
                          statusText = "Today";
                          rowClass = "bg-blue-500/6 border-blue-500/20";
                        } else {
                          status = "tomorrow";
                          statusText = "Tomorrow";
                          rowClass = "hover:bg-primary/4 border-border/40";
                        }
                      } else {
                        status = "upcoming";
                        statusText = "Upcoming";
                        rowClass = "hover:bg-primary/4 border-border/40";
                      }
                    }
                    
                    return (
                      <TableRow
                        key={entry.id}
                        className={rowClass}
                      >
                        <TableCell className="font-medium pl-4 sm:pl-6 py-3 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-xs sm:text-sm">
                              {new Date(entry.date).toLocaleDateString("en-US", {
                                month: "short", day: "numeric", year: "numeric",
                              })}
                            </span>
                            {status === "today" && (
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
                          {status === "passed" ? (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30">Passed</Badge>
                          ) : status === "today" ? (
                            <Badge className="text-[10px] px-1.5 py-0 bg-primary/20 text-primary hover:bg-primary/30 border-primary/30">Today</Badge>
                          ) : status === "tomorrow" ? (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-500/40 text-amber-600 dark:text-amber-400">Tomorrow</Badge>
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
