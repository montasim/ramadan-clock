import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { LogoutButton } from "./logout-button";
import { MobileNav } from "./mobile-nav";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-center px-4">
        <div className="flex w-full max-w-5xl items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2 font-semibold">
              <span>🌙</span>
              <span>Ramadan Clock</span>
            </Link>
            <nav className="hidden md:flex items-center gap-4">
              <Link
                href="/"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Today
              </Link>
              <Link
                href="/calendar"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Calendar
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <MobileNav user={user} />
            <div className="hidden md:flex items-center gap-4">
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
                  <Button variant="outline" size="sm">
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
