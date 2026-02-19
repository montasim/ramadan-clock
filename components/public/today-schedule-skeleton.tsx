import { Skeleton } from "@/components/ui/skeleton";

export default function TodayScheduleSkeleton() {
  return (
    <div className="w-full max-w-5xl space-y-6 sm:space-y-8">
      {/* Hero banner skeleton */}
      <div className="rounded-2xl border border-border/40 bg-card p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
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
        <div className="rounded-2xl border border-border/40 bg-card p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Skeleton className="h-8 sm:h-9 w-8 sm:w-9 rounded-xl" />
            <div className="space-y-1 sm:space-y-1.5">
              <Skeleton className="h-2.5 sm:h-3 w-14 sm:w-16" />
              <Skeleton className="h-2.5 sm:h-3 w-20 sm:w-24" />
            </div>
          </div>
          <Skeleton className="h-12 sm:h-14 w-32 sm:w-40" />
          <Skeleton className="h-3 sm:h-4 w-24 sm:w-28" />
        </div>
        <div className="rounded-2xl border border-border/40 bg-card p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Skeleton className="h-8 sm:h-9 w-8 sm:w-9 rounded-xl" />
            <div className="space-y-1 sm:space-y-1.5">
              <Skeleton className="h-2.5 sm:h-3 w-14 sm:w-16" />
              <Skeleton className="h-2.5 sm:h-3 w-20 sm:w-24" />
            </div>
          </div>
          <Skeleton className="h-12 sm:h-14 w-32 sm:w-40" />
          <Skeleton className="h-3 sm:h-4 w-24 sm:w-28" />
        </div>
      </div>

      {/* Quick links skeleton */}
      <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
        <div className="h-1 w-full bg-muted rounded-t-xl" />
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div className="space-y-1 sm:space-y-1.5">
            <Skeleton className="h-4 sm:h-5 w-24 sm:w-28" />
            <Skeleton className="h-3 sm:h-4 w-40 sm:w-48" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 sm:h-9 w-32 sm:w-40 rounded-full" />
            <Skeleton className="h-8 sm:h-9 w-24 sm:w-28 rounded-full" />
            <Skeleton className="h-8 sm:h-9 w-28 sm:w-32 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
