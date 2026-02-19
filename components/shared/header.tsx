import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { LogoutButton } from "./logout-button";
import { MobileNav } from "./mobile-nav";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Clock, CalendarDays, Mail } from "lucide-react";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-center px-4">
        <div className="flex w-full max-w-5xl items-center justify-between">

          {/* Brand + Nav */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-lg">
              <span
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white text-base"
                style={{ background: "var(--grad-primary)" }}
              >
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

          {/* Right side */}
          <div className="flex items-center gap-3">
            <MobileNav user={user} />
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/admin/dashboard"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Dashboard
                  </Link>
                  <LogoutButton />
                </div>
              ) : (
                <Link href="/auth/login">
                  <Button size="sm" className="btn-gradient rounded-full px-5 text-sm font-semibold h-9">
                    Admin
                  </Button>
                </Link>
              )}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
