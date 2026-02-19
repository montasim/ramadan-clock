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
import { Clock, Moon, Sun } from "lucide-react";
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
      <div className="space-y-6">                                                                                                                                                           
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">                                                                                                
            <div>
              <h1 className="text-3xl font-semibold">Today&apos;s Schedule</h1>
          <p className="text-muted-foreground">{today}</p>
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
            <DownloadButton location={location} type="today" />
          </Button>
        </div>
      </div>

      {todaySchedule ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sun className="h-24 w-24" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sun className="h-5 w-5 text-amber-500" />
                Sehri
              </CardTitle>
              <CardDescription>End time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-semibold">{todaySchedule.sehri}</div>
              {todaySchedule.location && (
                <p className="text-sm text-muted-foreground mt-2">
                  {todaySchedule.location}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Moon className="h-24 w-24" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Moon className="h-5 w-5 text-indigo-500" />
                Iftar
              </CardTitle>
              <CardDescription>Start time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-semibold">{todaySchedule.iftar}</div>
              {todaySchedule.location && (
                <p className="text-sm text-muted-foreground mt-2">
                  {todaySchedule.location}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Schedule Available</h3>
            <p className="text-muted-foreground">
              Today&apos;s schedule has not been uploaded yet.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
          <CardDescription>
            Navigate to other sections
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/calendar">View Full Calendar</Link>
          </Button>
          {locations.map((loc) => (
            <Button key={loc} variant="outline" asChild>
              <Link href={`/location/${encodeURIComponent(loc)}`}>
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
    <div className="w-full max-w-5xl mx-auto py-12 px-4 space-y-6">
      <Suspense fallback={<TodayScheduleSkeleton />}>
        <TodayScheduleContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
