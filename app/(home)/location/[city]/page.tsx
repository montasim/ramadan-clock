import { getFullSchedule, getLocations } from "@/actions/time-entries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DownloadButton } from "@/components/shared/download-button";

interface LocationPageProps {
  params: Promise<{ city: string }>;
}

export async function generateStaticParams() {
  const locations = await getLocations();
  return locations.map((location) => ({ city: encodeURIComponent(location) }));
}

export default async function LocationPage({ params }: LocationPageProps) {
  const { city } = await params;
  const decodedCity = decodeURIComponent(city);
  const locations = await getLocations();
  if (!locations.includes(decodedCity)) notFound();

  const schedule = await getFullSchedule(decodedCity);
  const today = new Date().toISOString().split("T")[0];

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
            <p className="text-xs font-bold uppercase tracking-[0.2em] gradient-text mb-1">
              Location Schedule
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
              <span className="gradient-text">{decodedCity}</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Sehri &amp; Iftar schedule for {decodedCity}
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

      {/* Table */}
      <Card className="border-border/60 overflow-hidden shadow-sm bg-card/70 backdrop-blur-sm">
        <div className="h-[2px] w-full" style={{ background: "var(--grad-primary)" }} />
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Schedule
          </CardTitle>
          <CardDescription>{schedule.length} entries found</CardDescription>
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
                        className={isToday ? "bg-blue-500/6 border-blue-500/20" : "hover:bg-primary/4 border-border/40"}
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
                        <TableCell className="font-semibold text-amber-600 dark:text-amber-400 px-2 sm:px-4">{entry.sehri}</TableCell>
                        <TableCell className="font-semibold text-violet-600 dark:text-violet-400 px-2 sm:px-4">{entry.iftar}</TableCell>
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
            <div className="text-center py-16 text-muted-foreground">
              No entries for {decodedCity}.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
