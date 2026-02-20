import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CalendarSkeleton() {
  return (
    <div className="space-y-7">
      {/* Hero banner */}
      <div className="hero-section px-6 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 relative overflow-hidden">
        {/* Decorative mini orb inside hero */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-15 blur-3xl pointer-events-none bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse" />
        
        <div className="relative z-10 space-y-2">
          {/* Small badge with icon */}
          <div className="flex items-center gap-1">
            <Skeleton variant="primary" className="h-3.5 w-3.5 rounded-full" />
            <Skeleton variant="primary" className="h-4 w-28 rounded-full" />
          </div>
          {/* Title */}
          <Skeleton variant="primary" className="h-10 w-52" />
          {/* Subtitle */}
          <Skeleton variant="default" className="h-4 w-48" />
        </div>
        
        {/* Location selector and download button */}
        <div className="flex items-center gap-2 shrink-0 relative z-10">
          <Skeleton variant="default" className="h-10 w-[200px] rounded-md" />
          <Skeleton variant="primary" className="h-10 w-10 rounded-md" />
        </div>
      </div>

      {/* Next day info card skeleton */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold uppercase tracking-wide text-primary">
            <Skeleton variant="primary" className="h-4 w-32" />
          </CardTitle>
          <CardDescription>
            <Skeleton variant="default" className="h-4 w-56" />
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Main Sehri / Iftar Cards skeleton */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Sehri card skeleton */}
        <div className="relative overflow-hidden rounded-2xl p-6 shadow-sm bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Skeleton variant="sehri" className="h-32 w-32 rounded-full" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <Skeleton variant="sehri" className="h-9 w-9 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton variant="sehri" className="h-3 w-16" />
              <Skeleton variant="default" className="h-3 w-24" />
            </div>
          </div>
          <Skeleton variant="sehri" className="h-14 w-40" />
          <Skeleton variant="default" className="h-4 w-28 mt-3" />
        </div>

        {/* Iftar card skeleton */}
        <div className="relative overflow-hidden rounded-2xl p-6 shadow-sm bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-violet-500/20">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Skeleton variant="iftar" className="h-32 w-32 rounded-full" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <Skeleton variant="iftar" className="h-9 w-9 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton variant="iftar" className="h-3 w-16" />
              <Skeleton variant="default" className="h-3 w-24" />
            </div>
          </div>
          <Skeleton variant="iftar" className="h-14 w-40" />
          <Skeleton variant="default" className="h-4 w-28 mt-3" />
        </div>
      </div>

      {/* Table Card skeleton */}
      <Card className="border-border/60 overflow-hidden shadow-sm bg-card/70 backdrop-blur-sm">
        <div className="h-[2px] w-full bg-gradient-to-r from-blue-500/20 to-purple-500/20" />
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            <Skeleton variant="primary" className="h-5 w-32" />
          </CardTitle>
          <CardDescription>
            <Skeleton variant="default" className="h-4 w-56" />
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="pl-4 sm:pl-6"><Skeleton variant="primary" className="h-4 w-20" /></TableHead>
                <TableHead><Skeleton variant="sehri" className="h-4 w-14" /></TableHead>
                <TableHead><Skeleton variant="iftar" className="h-4 w-14" /></TableHead>
                <TableHead><Skeleton variant="default" className="h-4 w-20" /></TableHead>
                <TableHead className="text-center pr-4 sm:pr-6 hidden md:table-cell"><Skeleton variant="primary" className="h-4 w-16" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i} className="border-border/40">
                  <TableCell className="pl-4 sm:pl-6">
                    <div className="flex flex-col gap-1">
                      <Skeleton variant="default" className="h-4 w-36" />
                      <Skeleton variant="primary" className="h-3 w-12 rounded-full" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton variant="sehri" className="h-4 w-14" /></TableCell>
                  <TableCell><Skeleton variant="iftar" className="h-4 w-14" /></TableCell>
                  <TableCell><Skeleton variant="default" className="h-4 w-24" /></TableCell>
                  <TableCell className="text-center pr-4 sm:pr-6 hidden md:table-cell"><Skeleton variant="primary" className="h-6 w-16 rounded-full" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
