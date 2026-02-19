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
import { Download } from "lucide-react";
import { Suspense } from "react";
import CalendarSkeleton from "@/components/public/calendar-skeleton";

async function CalendarContent({ searchParams }: { searchParams: Promise<{ location?: string }> }) {
  const { location } = await searchParams;
  const schedule = await getFullSchedule(location || null);
  const locations = await getLocations();

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Full Schedule</h1>
          <p className="text-muted-foreground">
            Complete Sehri & Iftar timetable
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue={location || "all"}>
            <SelectTrigger className="w-[200px]">
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
          <Button variant="outline" size="icon" asChild>
            <a href={`/api/pdf?location=${location || ""}&type=full`} target="_blank">
              <Download className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schedule Table</CardTitle>
          <CardDescription>
            {schedule.length} entries {location ? `for ${location}` : "across all locations"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {schedule.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Date</TableHead>
                    <TableHead>Sehri</TableHead>
                    <TableHead>Iftar</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedule.map((entry) => {
                    const isToday = entry.date === today;
                    const entryDate = new Date(entry.date);
                    const isPast = entryDate < new Date(today);

                    return (
                      <TableRow
                        key={entry.id}
                        className={isToday ? "bg-primary/5" : ""}
                      >
                        <TableCell className="font-medium">
                          {new Date(entry.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                          {isToday && (
                            <Badge variant="default" className="ml-2">
                              Today
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{entry.sehri}</TableCell>
                        <TableCell>{entry.iftar}</TableCell>
                        <TableCell>{entry.location || "-"}</TableCell>
                        <TableCell className="text-center">
                          {isPast ? (
                            <Badge variant="secondary">Past</Badge>
                          ) : isToday ? (
                            <Badge variant="default">Today</Badge>
                          ) : (
                            <Badge variant="outline">Upcoming</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No schedule entries found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ location?: string }> }) {
  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-4">
      <Suspense fallback={<CalendarSkeleton />}>
        <CalendarContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
