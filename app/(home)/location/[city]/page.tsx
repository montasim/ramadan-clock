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

  // Check if location exists
  if (!locations.includes(decodedCity)) {
    notFound();
  }

  const schedule = await getFullSchedule(decodedCity);

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <MapPin className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">{decodedCity}</h1>
            <p className="text-muted-foreground">
              Sehri & Iftar schedule for {decodedCity}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/calendar">Back to Calendar</Link>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <DownloadButton location={decodedCity} type="full" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schedule for {decodedCity}</CardTitle>
          <CardDescription>
            {schedule.length} entries found
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
              No schedule entries found for {decodedCity}.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
