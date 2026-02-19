import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getStats, getFullSchedule } from "@/actions/time-entries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar, Clock, MapPin, Upload, LayoutDashboard } from "lucide-react";
import { CalendarView } from "@/components/admin/calendar-view";

export default async function AdminDashboard() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const stats = await getStats();
  const schedule = await getFullSchedule(null);

  const statCards = [
    {
      title: "Total Entries",
      value: stats.totalEntries,
      description: "Schedule entries in database",
      icon: Calendar,
      gradient: "var(--grad-primary)",
      iconBg: "oklch(0.52 0.22 290 / 0.12)",
      iconColor: "text-primary",
    },
    {
      title: "Locations",
      value: stats.totalLocations,
      description: "Cities covered",
      icon: MapPin,
      gradient: "var(--grad-sehri)",
      iconBg: "oklch(0.75 0.18 60 / 0.12)",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "Recent Uploads",
      value: stats.recentUploads.length,
      description: "Last 5 uploads",
      icon: Clock,
      gradient: "var(--grad-iftar)",
      iconBg: "oklch(0.55 0.18 260 / 0.12)",
      iconColor: "text-indigo-600 dark:text-indigo-400",
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-4 space-y-8">
      {/* ── Header ──────────────────────────────── */}
      <div className="hero-section rounded-2xl px-6 py-7 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl" style={{ background: "var(--grad-primary)" }}>
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
            <p className="text-muted-foreground text-sm">Manage Sehri &amp; Iftar schedules</p>
          </div>
        </div>
        <Link href="/admin/upload">
          <Button className="btn-gradient rounded-full gap-2">
            <Upload className="h-4 w-4" />
            Upload Schedule
          </Button>
        </Link>
      </div>

      {/* ── Stat Cards ─────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-3">
        {statCards.map(({ title, value, description, icon: Icon, gradient, iconBg, iconColor }) => (
          <Card key={title} className="border-border/60 overflow-hidden shadow-sm">
            <div className="h-1 w-full" style={{ background: gradient }} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
              <div className="p-2 rounded-lg" style={{ background: iconBg }}>
                <Icon className={`h-4 w-4 ${iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold gradient-text">{value}</div>
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Calendar Card ──────────────────────── */}
      <Card className="border-border/60 overflow-hidden shadow-sm">
        <div className="h-1 w-full" style={{ background: "var(--grad-primary)" }} />
        <CardHeader>
          <CardTitle className="text-base">Schedule Calendar</CardTitle>
          <CardDescription>
            Manage all Sehri &amp; Iftar entries ({schedule.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {schedule.length > 0 ? (
            <CalendarView entries={schedule} />
          ) : (
            <div className="text-center py-14 text-muted-foreground">
              <p className="mb-4">No schedule entries yet.</p>
              <Link href="/admin/upload">
                <Button className="btn-gradient rounded-full gap-2">
                  <Upload className="h-4 w-4" />
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
