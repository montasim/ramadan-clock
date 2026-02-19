import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { LogoutButton } from "./logout-button";
import { MobileNav } from "./mobile-nav";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="flex h-16 items-center justify-center px-4">
        <div className="flex w-full max-w-5xl items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2 font-bold text-lg">
              <span className="text-xl">🌙</span>
              <span className="gradient-text">Ramadan Clock</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className="relative px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground rounded-md hover:bg-accent/50"
              >
                Today
              </Link>
              <Link
                href="/calendar"
                className="relative px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground rounded-md hover:bg-accent/50"
              >
                Calendar
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <MobileNav user={user} />
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/admin/dashboard"
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Dashboard
                  </Link>
                  <LogoutButton />
                </div>
              ) : (
                <Link href="/auth/login">
                  <Button
                    size="sm"
                    className="btn-gradient rounded-full px-4"
                  >
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
