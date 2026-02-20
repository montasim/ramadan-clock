import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TodayScheduleSkeleton() {
  return (
    <div className="w-full max-w-5xl space-y-6 sm:space-y-8">
      {/* ── Hero Banner ─────────────────────── */}
      <div className="hero-section px-6 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 relative overflow-hidden">
        {/* Decorative mini orb inside hero */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse" />
        
        <div className="relative z-10 space-y-2">
          {/* Small badge */}
          <Skeleton variant="primary" className="h-3 sm:h-4 w-24 sm:w-32 rounded-full" />
          {/* Title */}
          <Skeleton variant="primary" className="h-8 sm:h-10 w-40 sm:w-56" />
          {/* Subtitle */}
          <Skeleton variant="default" className="h-3 sm:h-4 w-32 sm:w-40" />
        </div>
        
        {/* Location selector and download button */}
        <div className="flex items-center gap-2 shrink-0 relative z-10">
          <Skeleton variant="default" className="h-9 sm:h-10 w-[160px] sm:w-[200px] rounded-md" />
          <Skeleton variant="primary" className="h-9 sm:h-10 w-9 sm:w-10 rounded-md" />
        </div>
      </div>
      
      {/* ── Sehri / Iftar Cards ─────────────── */}
      <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
        {/* Sehri Card */}
        <div className="relative overflow-hidden rounded-2xl p-4 sm:p-6 shadow-sm bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
          {/* Large decorative icon */}
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Skeleton variant="sehri" className="h-32 w-32 rounded-full" />
          </div>
          
          {/* Icon container and labels */}
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Skeleton variant="sehri" className="h-8 sm:h-9 w-8 sm:w-9 rounded-xl" />
            <div className="space-y-1 sm:space-y-1.5">
              <Skeleton variant="sehri" className="h-2.5 sm:h-3 w-14 sm:w-16" />
              <Skeleton variant="default" className="h-2.5 sm:h-3 w-20 sm:w-24" />
            </div>
          </div>
          
          {/* Large time display */}
          <Skeleton variant="sehri" className="h-12 sm:h-14 w-32 sm:w-40" />
          
          {/* Optional countdown timer */}
          <Skeleton variant="default" className="h-3 sm:h-4 w-24 sm:w-28 mt-3" />
          
          {/* Location text */}
          <Skeleton variant="default" className="h-3 sm:h-4 w-20 sm:w-24 mt-2" />
        </div>

        {/* Iftar Card */}
        <div className="relative overflow-hidden rounded-2xl p-4 sm:p-6 shadow-sm bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-violet-500/20">
          {/* Large decorative icon */}
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Skeleton variant="iftar" className="h-32 w-32 rounded-full" />
          </div>
          
          {/* Icon container and labels */}
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Skeleton variant="iftar" className="h-8 sm:h-9 w-8 sm:w-9 rounded-xl" />
            <div className="space-y-1 sm:space-y-1.5">
              <Skeleton variant="iftar" className="h-2.5 sm:h-3 w-14 sm:w-16" />
              <Skeleton variant="default" className="h-2.5 sm:h-3 w-20 sm:w-24" />
            </div>
          </div>
          
          {/* Large time display */}
          <Skeleton variant="iftar" className="h-12 sm:h-14 w-32 sm:w-40" />
          
          {/* Optional countdown timer */}
          <Skeleton variant="default" className="h-3 sm:h-4 w-24 sm:w-28 mt-3" />
          
          {/* Location text */}
          <Skeleton variant="default" className="h-3 sm:h-4 w-20 sm:w-24 mt-2" />
        </div>
      </div>

      {/* ── Today's Passed Schedule Card ─────────────────────── */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold uppercase tracking-wide text-primary">
            <Skeleton variant="primary" className="h-4 sm:h-5 w-40 sm:w-48" />
          </CardTitle>
          <CardDescription>
            <Skeleton variant="default" className="h-3 sm:h-4 w-56 sm:w-64" />
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <Skeleton variant="sehri" className="h-3 w-16 mb-1" />
            <Skeleton variant="default" className="h-5 w-20" />
          </div>
          <div className="flex-1">
            <Skeleton variant="iftar" className="h-3 w-16 mb-1" />
            <Skeleton variant="default" className="h-5 w-20" />
          </div>
        </CardContent>
      </Card>
      
      {/* ── Hadith of the Day ─────────────────────── */}
      <Card className="border-primary/30 overflow-hidden shadow-sm bg-primary/5 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton variant="primary" className="h-4 w-4 rounded-full" />
            <CardTitle className="text-sm font-bold uppercase tracking-wide text-primary">
              <Skeleton variant="primary" className="h-4 sm:h-5 w-32 sm:w-36" />
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Quote text */}
          <Skeleton variant="default" className="h-4 w-full" />
          <Skeleton variant="default" className="h-4 w-11/12" />
          <Skeleton variant="default" className="h-4 w-10/12" />
          
          {/* Source with decorative lines */}
          <div className="flex items-center gap-2 mt-4">
            <Skeleton variant="default" className="h-px flex-1" />
            <Skeleton variant="primary" className="h-3 w-24" />
            <Skeleton variant="default" className="h-px flex-1" />
          </div>
        </CardContent>
      </Card>

      {/* ── Quick Links ─────────────────────── */}
      <Card className="border-primary/30 overflow-hidden shadow-sm bg-primary/5 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold uppercase tracking-wide text-primary">
            <Skeleton variant="primary" className="h-4 sm:h-5 w-24 sm:w-28" />
          </CardTitle>
          <CardDescription>
            <Skeleton variant="default" className="h-3 sm:h-4 w-40 sm:w-48" />
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {/* Full Calendar button - gradient */}
          <Skeleton variant="primary" className="h-8 sm:h-9 w-32 sm:w-40 rounded-full" />
          {/* Location buttons */}
          <Skeleton variant="default" className="h-8 sm:h-9 w-24 sm:w-28 rounded-full" />
          <Skeleton variant="default" className="h-8 sm:h-9 w-28 sm:w-32 rounded-full" />
          <Skeleton variant="default" className="h-8 sm:h-9 w-24 sm:w-28 rounded-full" />
        </CardContent>
      </Card>
    </div>
  );
}
