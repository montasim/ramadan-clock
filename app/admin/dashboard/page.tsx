import { withDashboardGuard } from "@/lib/guards/dashboard-guard";
import { getStats, getFullSchedule } from "@/actions/time-entries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar, Clock, MapPin, Upload, LayoutDashboard } from "lucide-react";
import { CalendarView } from "@/components/admin/calendar-view";
import { ScheduleCard } from "@/components/shared/schedule-card";
import { getAdminMetadata } from "@/lib/seo/metadata";

export const metadata = getAdminMetadata('Dashboard');

// Admin pages should never be cached - they need real-time data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboard() {
  const session = await withDashboardGuard();

  const stats = await getStats();
  const schedule = await getFullSchedule(null);

  const statCards = [
    {
      title: "Total Entries",
      value: stats.totalEntries,
      description: "Schedule entries in database",
      icon: Calendar,
      gradient: "linear-gradient(135deg,#3b82f6,#a855f7)",
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "rgba(59,130,246,0.12)",
    },
    {
      title: "Locations",
      value: stats.totalLocations,
      description: "Cities covered",
      icon: MapPin,
      gradient: "linear-gradient(135deg,#f59e0b,#f97316)",
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "rgba(245,158,11,0.12)",
    },
    {
      title: "Recent Uploads",
      value: stats.recentUploads.length,
      description: "Last 5 uploads",
      icon: Clock,
      gradient: "linear-gradient(135deg,#8b5cf6,#06b6d4)",
      iconColor: "text-violet-600 dark:text-violet-400",
      iconBg: "rgba(139,92,246,0.12)",
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto py-6 sm:py-10 px-4 space-y-6 sm:space-y-8">
      {/* ── Hero ─────────────────────────────── */}
      <div className="hero-section px-5 py-6 sm:px-8 sm:py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6 overflow-hidden relative">
        <div
          className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: "var(--grad-primary)" }}
        />
        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 relative z-10 text-center sm:text-left">
          <div
            className="p-3 rounded-xl shadow-lg hidden sm:block"
            style={{ background: "var(--grad-primary)" }}
          >
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] gradient-text mb-1 sm:mb-0.5">Admin Panel</p>
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Dashboard</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">Manage Sehri &amp; Iftar schedules</p>
          </div>
        </div>
        <Link href="/admin/upload" className="relative z-10 w-full sm:w-auto">
          <Button className="btn-gradient rounded-full gap-2 font-semibold w-full sm:w-auto px-6">
            <Upload className="h-4 w-4" />
            Upload Schedule
          </Button>
        </Link>
      </div>

      {/* ── Stat Cards ──────────────────────── */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map(({ title, value, description, icon: Icon, gradient, iconColor, iconBg }) => (
          <Card key={title} className="border-primary/30 overflow-hidden shadow-sm bg-primary/5 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
              <CardTitle className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {title}
              </CardTitle>
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

      {/* ── Calendar Card ───────────────────── */}
      <ScheduleCard
        title="Schedule Calendar"
        description={`Manage all Sehri & Iftar entries (${schedule.length} total)`}
      >
        {schedule.length > 0 ? (
          <CalendarView entries={schedule} />
        ) : (
          <div className="text-center py-14 text-muted-foreground">
            <p className="mb-4">No schedule entries yet.</p>
            <Link href="/admin/upload">
              <Button className="btn-gradient rounded-full gap-2 font-semibold">
                <Upload className="h-4 w-4" />
                Upload Schedule
              </Button>
            </Link>
          </div>
        )}
      </ScheduleCard>
    </div>
  );
}
