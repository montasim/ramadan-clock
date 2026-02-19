# UI and Functional Enhancements Plan for Ramadan Clock

## Overview
This plan outlines the implementation of multiple UI and functional enhancements to the Ramadan Clock application, including time format changes, icon additions, new pages, and improved skeleton loaders.

---

## 1. Configuration File for Environment Variables

### File: `lib/config.ts`

Create a centralized configuration file to manage all environment variables:

```typescript
// lib/config.ts
import { z } from "zod";

// Configuration schema for validation
const configSchema = z.object({
  // Database
  databaseUrl: z.string().url(),

  // NextAuth
  nextAuthSecret: z.string().min(1),
  nextAuthUrl: z.string().url(),

  // Admin
  adminEmail: z.string().email(),
  adminPassword: z.string().min(1),

  // Project Info
  projectRepoUrl: z.string().url(),

  // Developer Info
  developerName: z.string(),
  developerBio: z.string(),
  developerGithub: z.string().url(),
  developerLinkedin: z.string().url(),
  developerEmail: z.string().email(),

  // Hadith API (optional)
  hadithApiKey: z.string().optional(),
});

// Export validated configuration
export const config = configSchema.parse({
  databaseUrl: process.env.DATABASE_URL,
  nextAuthSecret: process.env.NEXTAUTH_SECRET,
  nextAuthUrl: process.env.NEXTAUTH_URL,
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  projectRepoUrl: process.env.PROJECT_REPO_URL,
  developerName: process.env.DEVELOPER_NAME,
  developerBio: process.env.DEVELOPER_BIO,
  developerGithub: process.env.DEVELOPER_GITHUB,
  developerLinkedin: process.env.DEVELOPER_LINKEDIN,
  developerEmail: process.env.DEVELOPER_EMAIL,
  hadithApiKey: process.env.HADITH_API_KEY,
});
```

### Update `.env.example`:
```env
# Add Hadith API Key (optional - for free tier may not be required)
HADITH_API_KEY="your-hadith-api-key"
```

---

## 2. 12-Hour Time Format

### File: `lib/utils.ts`

Add utility function to convert 24-hour time to 12-hour format:

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert 24-hour time format (HH:MM) to 12-hour format (h:MM AM/PM)
 * @param time24 - Time in 24-hour format (e.g., "14:30")
 * @returns Time in 12-hour format (e.g., "2:30 PM")
 */
export function formatTime12Hour(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}
```

### File: `actions/time-entries.ts`

Update to use 12-hour format when returning schedule data:

```typescript
// actions/time-entries.ts
import { formatTime12Hour } from "@/lib/utils";
import { prisma, type TimeEntry } from "@/lib/db";
// ... existing imports

// Helper function to format time entries
function formatTimeEntry(entry: TimeEntry): TimeEntry {
  return {
    ...entry,
    sehri: formatTime12Hour(entry.sehri),
    iftar: formatTime12Hour(entry.iftar),
  };
}

export async function getTodaySchedule(location?: string | null): Promise<TimeEntry | null> {
  // ... existing code
  const entry = await prisma.timeEntry.findFirst({ where });
  return entry ? formatTimeEntry(entry) : null;
}

export async function getFullSchedule(location?: string | null): Promise<TimeEntry[]> {
  // ... existing code
  const entries = await prisma.timeEntry.findMany({ where, orderBy });
  return entries.map(formatTimeEntry);
}
```

---

## 3. Add Icons to Navigation

### File: `components/shared/header.tsx`

Add icons to navbar navigation links:

```typescript
// components/shared/header.tsx
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { LogoutButton } from "./logout-button";
import { MobileNav } from "./mobile-nav";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Clock, CalendarDays } from "lucide-react"; // Add icons

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-center px-4">
        <div className="flex w-full max-w-5xl items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-lg">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white text-base" style={{ background: "var(--grad-primary)" }}>
                🌙
              </span>
              <span className="gradient-text tracking-tight">Ramadan Clock</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className="flex items-center gap-2 px-3.5 py-1.5 text-sm font-medium text-muted-foreground rounded-lg transition-all hover:text-foreground hover:bg-primary/8"
              >
                <Clock className="h-4 w-4" />
                Today
              </Link>
              <Link
                href="/calendar"
                className="flex items-center gap-2 px-3.5 py-1.5 text-sm font-medium text-muted-foreground rounded-lg transition-all hover:text-foreground hover:bg-primary/8"
              >
                <CalendarDays className="h-4 w-4" />
                Calendar
              </Link>
              <Link
                href="/contact"
                className="flex items-center gap-2 px-3.5 py-1.5 text-sm font-medium text-muted-foreground rounded-lg transition-all hover:text-foreground hover:bg-primary/8"
              >
                <Mail className="h-4 w-4" />
                Contact
              </Link>
            </nav>
          </div>
          {/* ... rest of component */}
        </div>
      </div>
    </header>
  );
}
```

### File: `components/shared/mobile-nav.tsx`

Add icons to mobile navigation links:

```typescript
// components/shared/mobile-nav.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Clock, CalendarDays, Mail } from "lucide-react"; // Add icons
import { Button } from "@/components/ui/button";

// ... existing interface

export function MobileNav({ user }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 border-b border-border/40 bg-background/95 backdrop-blur-xl p-5 md:hidden z-50">
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "var(--grad-primary)" }} />
          <nav className="flex flex-col space-y-1">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground rounded-lg hover:bg-accent/50"
              onClick={() => setIsOpen(false)}
            >
              <Clock className="h-4 w-4" />
              Today
            </Link>
            <Link
              href="/calendar"
              className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground rounded-lg hover:bg-accent/50"
              onClick={() => setIsOpen(false)}
            >
              <CalendarDays className="h-4 w-4" />
              Calendar
            </Link>
            <Link
              href="/contact"
              className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground rounded-lg hover:bg-accent/50"
              onClick={() => setIsOpen(false)}
            >
              <Mail className="h-4 w-4" />
              Contact
            </Link>
            {/* ... rest of nav */}
          </nav>
        </div>
      )}
    </>
  );
}
```

### File: `app/page.tsx`

Replace unicode calendar icon with lucide-react Calendar icon:

```typescript
// app/page.tsx
import { CalendarDays, Clock, Moon, Sun, MapPin } from "lucide-react"; // Add CalendarDays

// In Quick Links section:
<Button asChild className="btn-gradient rounded-full font-semibold">
  <Link href="/calendar">
    <CalendarDays className="h-4 w-4 mr-1.5" />
    Full Calendar
  </Link>
</Button>
```

---

## 4. Next Day's Schedule After Iftar Time

### File: `actions/time-entries.ts`

Add function to get next day's schedule and helper to check if iftar has passed:

```typescript
// actions/time-entries.ts
import { formatTime12Hour } from "@/lib/utils";
import { prisma, type TimeEntry } from "@/lib/db";
import { revalidatePath } from "next/cache";

// ... existing functions

/**
 * Check if iftar time has passed for today
 */
function hasIftarPassed(todaySchedule: TimeEntry): boolean {
  const now = new Date();
  const [iftarHours, iftarMinutes] = todaySchedule.iftar.split(':').map(Number);
  const iftarTime = new Date();
  iftarTime.setHours(iftarHours, iftarMinutes, 0, 0);
  return now >= iftarTime;
}

/**
 * Get today's schedule or next day's schedule if iftar has passed
 */
export async function getTodayOrNextDaySchedule(location?: string | null): Promise<TimeEntry | null> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const where: Record<string, unknown> = { date: today };
    if (location) {
      where.location = location;
    }

    const todayEntry = await prisma.timeEntry.findFirst({ where });

    if (todayEntry && hasIftarPassed(todayEntry)) {
      // Get next day's schedule
      const tomorrowWhere: Record<string, unknown> = { date: tomorrowStr };
      if (location) {
        tomorrowWhere.location = location;
      }
      const tomorrowEntry = await prisma.timeEntry.findFirst({ where: tomorrowWhere });
      return tomorrowEntry ? formatTimeEntry(tomorrowEntry) : null;
    }

    return todayEntry ? formatTimeEntry(todayEntry) : null;
  } catch (error) {
    console.error("Error fetching today/next day schedule:", error);
    return null;
  }
}
```

### File: `app/page.tsx`

Update to use new function:

```typescript
// app/page.tsx
import { getTodayOrNextDaySchedule, getLocations } from "@/actions/time-entries";

async function TodayScheduleContent({ searchParams }: { searchParams: Promise<{ location?: string }> }) {
  const { location } = await searchParams;
  const todaySchedule = await getTodayOrNextDaySchedule(location || null);
  const locations = await getLocations();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-7">
      {/* ... rest of component */}
    </div>
  );
}
```

### File: `app/(home)/calendar/page.tsx`

Update to show next day's schedule after iftar:

```typescript
// app/(home)/calendar/page.tsx
import { getFullSchedule, getLocations, getTodayOrNextDaySchedule } from "@/actions/time-entries";

async function CalendarContent({ searchParams }: { searchParams: Promise<{ location?: string }> }) {
  const { location } = await searchParams;
  const schedule = await getFullSchedule(location || null);
  const locations = await getLocations();
  const todaySchedule = await getTodayOrNextDaySchedule(location || null);
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-7">
      {/* ... existing hero section */}

      {/* Add next day info card if iftar has passed */}
      {todaySchedule && todaySchedule.date !== today && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-wide text-primary">
              Next Day's Schedule
            </CardTitle>
            <CardDescription>
              Today's iftar time has passed. Showing tomorrow's schedule.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <div className="flex-1">
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">Sehri</p>
              <p className="text-lg font-semibold">{todaySchedule.sehri}</p>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-violet-600 dark:text-violet-400 mb-1">Iftar</p>
              <p className="text-lg font-semibold">{todaySchedule.iftar}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ... rest of component */}
    </div>
  );
}
```

### File: `app/(home)/location/[city]/page.tsx`

Update to show next day's schedule after iftar:

```typescript
// app/(home)/location/[city]/page.tsx
import { getFullSchedule, getLocations, getTodayOrNextDaySchedule } from "@/actions/time-entries";

export default async function LocationPage({ params }: LocationPageProps) {
  const { city } = await params;
  const decodedCity = decodeURIComponent(city);
  const locations = await getLocations();
  if (!locations.includes(decodedCity)) notFound();

  const schedule = await getFullSchedule(decodedCity);
  const todaySchedule = await getTodayOrNextDaySchedule(decodedCity);
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-4 space-y-7">
      {/* ... existing hero section */}

      {/* Add next day info card if iftar has passed */}
      {todaySchedule && todaySchedule.date !== today && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-wide text-primary">
              Next Day's Schedule
            </CardTitle>
            <CardDescription>
              Today's iftar time has passed. Showing tomorrow's schedule.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <div className="flex-1">
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">Sehri</p>
              <p className="text-lg font-semibold">{todaySchedule.sehri}</p>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-violet-600 dark:text-violet-400 mb-1">Iftar</p>
              <p className="text-lg font-semibold">{todaySchedule.iftar}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ... rest of component */}
    </div>
  );
}
```

---

## 5. Contact Page

### File: `app/contact/page.tsx`

Create new contact page:

```typescript
// app/contact/page.tsx
import { config } from "@/lib/config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, Linkedin, Mail, ExternalLink, User } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-4 space-y-7">
      {/* Hero */}
      <div className="hero-section px-6 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "var(--grad-primary)" }} />
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] gradient-text mb-2">
            <Mail className="inline h-3.5 w-3.5 mr-1" />
            Contact & About
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            Learn about the project and connect with the developer
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Project Info Card */}
        <Card className="border-border/60 overflow-hidden shadow-sm bg-card/70 backdrop-blur-sm">
          <div className="h-[2px] w-full" style={{ background: "var(--grad-primary)" }} />
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Project Information
            </CardTitle>
            <CardDescription>Open source Ramadan Clock project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Repository</p>
              <Button asChild variant="outline" className="w-full justify-start">
                <a href={config.projectRepoUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4 mr-2" />
                  View on GitHub
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </a>
              </Button>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Description</p>
              <p className="text-sm text-muted-foreground">
                A web application to track Sehri and Iftar times during Ramadan. Built with Next.js, Prisma, and PostgreSQL.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Developer Info Card */}
        <Card className="border-border/60 overflow-hidden shadow-sm bg-card/70 backdrop-blur-sm">
          <div className="h-[2px] w-full" style={{ background: "var(--grad-primary)" }} />
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Developer Information
            </CardTitle>
            <CardDescription>Project creator and maintainer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{config.developerName}</p>
                <p className="text-sm text-muted-foreground">{config.developerBio}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start">
                <a href={config.developerGithub} target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </a>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <a href={config.developerLinkedin} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </a>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <a href={`mailto:${config.developerEmail}`}>
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

## 6. Footer with Developer Social Icons

### File: `components/shared/footer.tsx`

Update footer to include developer social icons and hadith:

```typescript
// components/shared/footer.tsx
"use client";

import { config } from "@/lib/config";
import { Github, Linkedin, Mail, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";

export function Footer() {
  const [hadith, setHadith] = useState<{ text: string; source: string } | null>(null);

  useEffect(() => {
    // Fetch hadith on mount and rotate every 60 seconds
    const fetchHadith = async () => {
      try {
        const response = await fetch('/api/hadith');
        if (response.ok) {
          const data = await response.json();
          setHadith(data);
        }
      } catch (error) {
        console.error('Failed to fetch hadith:', error);
      }
    };

    fetchHadith();
    const interval = setInterval(fetchHadith, 60000); // Change every 60 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="relative border-t border-border/50 py-6 md:py-0">
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "var(--grad-primary)" }} />
      <div className="flex flex-col items-center justify-center gap-3 px-4 md:h-14">
        <div className="flex w-full max-w-5xl flex-col items-center justify-between gap-2 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()}{" "}
            <span className="gradient-text font-semibold">Ramadan Clock</span>.
            All rights reserved.
          </p>

          {/* Developer Social Icons */}
          <div className="flex items-center gap-3">
            <a
              href={config.developerGithub}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Developer GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href={config.developerLinkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Developer LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href={`mailto:${config.developerEmail}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Developer Email"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>

          <p className="text-sm text-muted-foreground">
            Built with ❤️ for the Ramadan community
          </p>
        </div>

        {/* Daily Hadith Section */}
        {hadith && (
          <div className="w-full max-w-5xl mt-4 p-4 rounded-lg bg-card/50 border border-border/40">
            <div className="flex items-start gap-2">
              <BookOpen className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm italic text-muted-foreground">"{hadith.text}"</p>
                <p className="text-xs text-muted-foreground mt-1">— {hadith.source}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}
```

---

## 7. Hadith API Integration

### File: `lib/hadith-api.ts`

Create Hadith API client:

```typescript
// lib/hadith-api.ts
import { config } from "./config";

interface HadithResponse {
  data: {
    hadith_english: string;
    hadith_source: string;
    book: {
      bookName: string;
    };
  }[];
}

export async function getRandomHadith(): Promise<{ text: string; source: string } | null> {
  try {
    // Using Hadith API (https://hadithapi.com)
    // For free tier, we can use public collections without API key
    const response = await fetch(
      'https://hadithapi.com/api/hadiths?apiKey=free&paginate=10&random=true',
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) {
      throw new Error('Failed to fetch hadith');
    }

    const data: HadithResponse = await response.json();

    if (data.data && data.data.length > 0) {
      const hadith = data.data[0];
      return {
        text: hadith.hadith_english,
        source: `${hadith.book.bookName} - ${hadith.hadith_source}`,
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching hadith:', error);
    return null;
  }
}
```

### File: `app/api/hadith/route.ts`

Create API route for hadith:

```typescript
// app/api/hadith/route.ts
import { NextResponse } from "next/server";
import { getRandomHadith } from "@/lib/hadith-api";

export async function GET() {
  const hadith = await getRandomHadith();

  if (!hadith) {
    return NextResponse.json(
      { error: "Failed to fetch hadith" },
      { status: 500 }
    );
  }

  return NextResponse.json(hadith);
}
```

---

## 8. Device-Specific Skeleton Loaders

### File: `components/public/today-schedule-skeleton.tsx`

Update to be mobile-friendly:

```typescript
// components/public/today-schedule-skeleton.tsx
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
```

### File: `components/public/location-skeleton.tsx`

Create new skeleton loader for location pages:

```typescript
// components/public/location-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function LocationSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero banner skeleton */}
      <div className="rounded-2xl border border-border/40 bg-card p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <Skeleton className="h-10 sm:h-12 w-10 sm:w-12 rounded-xl" />
          <div className="space-y-1.5 sm:space-y-2">
            <Skeleton className="h-3 sm:h-4 w-28 sm:w-32" />
            <Skeleton className="h-8 sm:h-10 w-40 sm:w-52" />
            <Skeleton className="h-3 sm:h-4 w-40 sm:w-48" />
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Skeleton className="h-9 sm:h-10 w-20 sm:w-24 rounded-full" />
          <Skeleton className="h-9 sm:h-10 w-9 sm:w-10 rounded-md" />
        </div>
      </div>

      {/* Table card skeleton */}
      <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
        <div className="h-1 w-full bg-muted" />
        <div className="p-4 sm:p-6 space-y-1.5 sm:space-y-2">
          <Skeleton className="h-4 sm:h-5 w-24 sm:w-32" />
          <Skeleton className="h-3 sm:h-4 w-36 sm:w-48" />
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/40">
                <TableHead className="pl-4 sm:pl-6"><Skeleton className="h-3.5 sm:h-4 w-16 sm:w-20" /></TableHead>
                <TableHead><Skeleton className="h-3.5 sm:h-4 w-12 sm:w-14" /></TableHead>
                <TableHead><Skeleton className="h-3.5 sm:h-4 w-12 sm:w-14" /></TableHead>
                <TableHead className="pr-4 sm:pr-6 hidden md:table-cell"><Skeleton className="h-3.5 sm:h-4 w-12 sm:w-16" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i} className="border-border/40">
                  <TableCell className="pl-4 sm:pl-6"><Skeleton className="h-3.5 sm:h-4 w-28 sm:w-36" /></TableCell>
                  <TableCell><Skeleton className="h-3.5 sm:h-4 w-12 sm:w-14" /></TableCell>
                  <TableCell><Skeleton className="h-3.5 sm:h-4 w-12 sm:w-14" /></TableCell>
                  <TableCell className="pr-4 sm:pr-6 hidden md:table-cell"><Skeleton className="h-5 sm:h-6 w-12 sm:w-16 rounded-full" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
```

### File: `app/(home)/location/[city]/page.tsx`

Add Suspense with skeleton:

```typescript
// app/(home)/location/[city]/page.tsx
import { getFullSchedule, getLocations, getTodayOrNextDaySchedule } from "@/actions/time-entries";
import LocationSkeleton from "@/components/public/location-skeleton";
import { Suspense } from "react";

// ... existing imports

async function LocationPageContent({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const decodedCity = decodeURIComponent(city);
  const locations = await getLocations();
  if (!locations.includes(decodedCity)) notFound();

  const schedule = await getFullSchedule(decodedCity);
  const todaySchedule = await getTodayOrNextDaySchedule(decodedCity);
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-4 space-y-7">
      {/* ... existing content */}
    </div>
  );
}

export default async function LocationPage({ params }: LocationPageProps) {
  return (
    <Suspense fallback={<LocationSkeleton />}>
      <LocationPageContent params={params} />
    </Suspense>
  );
}
```

---

## Summary of Changes

| Category | Files Modified | Files Created |
|----------|----------------|---------------|
| Configuration | `.env.example` | `lib/config.ts` |
| Time Format | `actions/time-entries.ts`, `lib/utils.ts` | - |
| Icons | `app/page.tsx`, `components/shared/header.tsx`, `components/shared/mobile-nav.tsx` | - |
| Next Day Schedule | `app/page.tsx`, `app/(home)/calendar/page.tsx`, `app/(home)/location/[city]/page.tsx`, `actions/time-entries.ts` | - |
| Contact Page | - | `app/contact/page.tsx` |
| Footer | `components/shared/footer.tsx` | - |
| Hadith API | - | `lib/hadith-api.ts`, `app/api/hadith/route.ts` |
| Skeleton Loaders | `components/public/today-schedule-skeleton.tsx`, `app/(home)/location/[city]/page.tsx` | `components/public/location-skeleton.tsx` |

---

## Implementation Order

1. Configuration file and environment variables
2. Time format conversion utility
3. Update time entries actions to use 12-hour format
4. Add icons to navigation
5. Implement next day schedule logic
6. Create contact page
7. Update footer with social icons
8. Implement hadith API integration
9. Update skeleton loaders for mobile responsiveness
10. Add skeleton to location page
11. Test all changes
