import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getStats, getFullSchedule } from "@/actions/time-entries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar, Clock, MapPin, Upload } from "lucide-react";
import { CalendarView } from "@/components/admin/calendar-view";

export default async function AdminDashboard() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const stats = await getStats();
  const schedule = await getFullSchedule(null);

  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-4 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage Sehri & Iftar schedules
            </p>
          </div>
          <Link href="/admin/upload">
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Schedule
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEntries}</div>
              <p className="text-xs text-muted-foreground">
                Schedule entries in database
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Locations</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLocations}</div>
              <p className="text-xs text-muted-foreground">
                Cities covered
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentUploads.length}</div>
              <p className="text-xs text-muted-foreground">
                Last 5 uploads
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Schedule Calendar</CardTitle>
            <CardDescription>
              Manage all Sehri & Iftar entries ({schedule.length} total)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {schedule.length > 0 ? (
              <CalendarView entries={schedule} />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No schedule entries yet.</p>
                <Link href="/admin/upload">
                  <Button className="mt-4">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Schedule
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
