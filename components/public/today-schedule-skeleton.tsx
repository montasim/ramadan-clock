import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TodayScheduleSkeleton() {
  return (
    <div className="w-full max-w-5xl space-y-6 sm:space-y-8">
      {/* Hero banner skeleton */}
      <div className="hero-section px-6 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
        <div className="space-y-2">
          <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
          <Skeleton className="h-8 sm:h-10 w-40 sm:w-56" />
          <Skeleton className="h-3 sm:h-4 w-32 sm:w-40" />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Skeleton className="h-9 sm:h-10 w-[160px] sm:w-[200px] rounded-md" />
          <Skeleton className="h-9 sm:h-10 w-9 sm:w-10 rounded-md" />
        </div>
      </div>

      {/* Cards skeleton - stacked on mobile, side by side on desktop */}
      <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
        {/* Sehri card skeleton */}
        <Card className="relative overflow-hidden rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Skeleton className="h-32 w-32 rounded-full" />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Skeleton className="h-8 sm:h-9 w-8 sm:w-9 rounded-xl" />
            <div className="space-y-1 sm:space-y-1.5">
              <Skeleton className="h-2.5 sm:h-3 w-14 sm:w-16" />
              <Skeleton className="h-2.5 sm:h-3 w-20 sm:w-24" />
            </div>
          </div>
          <Skeleton className="h-12 sm:h-14 w-32 sm:w-40" />
          <Skeleton className="h-3 sm:h-4 w-24 sm:w-28 mt-3" />
        </Card>

        {/* Iftar card skeleton */}
        <Card className="relative overflow-hidden rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Skeleton className="h-32 w-32 rounded-full" />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Skeleton className="h-8 sm:h-9 w-8 sm:w-9 rounded-xl" />
            <div className="space-y-1 sm:space-y-1.5">
              <Skeleton className="h-2.5 sm:h-3 w-14 sm:w-16" />
              <Skeleton className="h-2.5 sm:h-3 w-20 sm:w-24" />
            </div>
          </div>
          <Skeleton className="h-12 sm:h-14 w-32 sm:w-40" />
          <Skeleton className="h-3 sm:h-4 w-24 sm:w-28 mt-3" />
        </Card>
      </div>

      {/* Quick links skeleton */}
      <Card className="border-border/60 overflow-hidden shadow-sm bg-card/70 backdrop-blur-sm">
        <div className="h-[2px] w-full bg-muted" />
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            <Skeleton className="h-4 sm:h-5 w-24 sm:w-28" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-3 sm:h-4 w-40 sm:w-48" />
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Skeleton className="h-8 sm:h-9 w-32 sm:w-40 rounded-full" />
          <Skeleton className="h-8 sm:h-9 w-24 sm:w-28 rounded-full" />
          <Skeleton className="h-8 sm:h-9 w-28 sm:w-32 rounded-full" />
        </CardContent>
      </Card>
    </div>
  );
}
