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
  return locations.map((location) => ({
    city: encodeURIComponent(location),
  }));
}

export default async function LocationPage({ params }: LocationPageProps) {
  const { city } = await params;
  const decodedCity = decodeURIComponent(city);
  const locations = await getLocations();

  if (!locations.includes(decodedCity)) {
    notFound();
  }

  const schedule = await getFullSchedule(decodedCity);
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-4 space-y-8">
      {/* ── Hero Banner ─────────────────────────── */}
      <div className="hero-section rounded-2xl px-6 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl" style={{ background: "var(--grad-primary)" }}>
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest gradient-text mb-1">
              Location Schedule
            </p>
            <h1 className="text-4xl font-bold gradient-text">{decodedCity}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Sehri &amp; Iftar schedule for {decodedCity}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" asChild className="border-border/60 bg-background/70 backdrop-blur rounded-full">
            <Link href="/calendar">← Back to Calendar</Link>
          </Button>
          <Button variant="outline" size="icon" asChild className="border-border/60 bg-background/70 backdrop-blur">
            <DownloadButton location={decodedCity} type="full" />
          </Button>
        </div>
      </div>

      {/* ── Schedule Table ────────────────────── */}
      <Card className="border-border/60 overflow-hidden shadow-sm">
        <div className="h-1 w-full" style={{ background: "var(--grad-primary)" }} />
        <CardHeader>
          <CardTitle className="text-base">Schedule for {decodedCity}</CardTitle>
          <CardDescription>{schedule.length} entries found</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {schedule.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/60">
                    <TableHead className="w-[180px] pl-6">Date</TableHead>
                    <TableHead>Sehri</TableHead>
                    <TableHead>Iftar</TableHead>
                    <TableHead className="text-center pr-6">Status</TableHead>
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
                        className={
                          isToday
                            ? "bg-primary/8 border-primary/20 hover:bg-primary/10"
                            : "hover:bg-accent/30 border-border/40"
                        }
                      >
                        <TableCell className="font-medium pl-6">
                          {new Date(entry.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                          {isToday && (
                            <span
                              className="ml-2 text-xs px-2 py-0.5 rounded-full text-white font-semibold"
                              style={{ background: "var(--grad-primary)" }}
                            >
                              Today
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-amber-700 dark:text-amber-400 font-medium">
                          {entry.sehri}
                        </TableCell>
                        <TableCell className="text-indigo-700 dark:text-indigo-400 font-medium">
                          {entry.iftar}
                        </TableCell>
                        <TableCell className="text-center pr-6">
                          {isPast ? (
                            <Badge variant="secondary" className="text-xs">Past</Badge>
                          ) : isToday ? (
                            <span
                              className="text-xs px-2.5 py-0.5 rounded-full text-white font-semibold"
                              style={{ background: "var(--grad-primary)" }}
                            >
                              Today
                            </span>
                          ) : (
                            <Badge variant="outline" className="text-xs border-primary/30 text-primary">Upcoming</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground px-6">
              No schedule entries found for {decodedCity}.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
