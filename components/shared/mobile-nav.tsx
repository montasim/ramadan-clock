"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileNavProps {
  user: {
    email: string;
  } | null;
}

export function MobileNav({ user }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 border-b border-border/40 bg-background/95 backdrop-blur-xl p-5 md:hidden z-50">
          {/* Gradient accent top line */}
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "var(--grad-primary)" }} />
          <nav className="flex flex-col space-y-1">
            <Link
              href="/"
              className="px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground rounded-lg hover:bg-accent/50"
              onClick={() => setIsOpen(false)}
            >
              Today
            </Link>
            <Link
              href="/calendar"
              className="px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground rounded-lg hover:bg-accent/50"
              onClick={() => setIsOpen(false)}
            >
              Calendar
            </Link>
            {user ? (
              <>
                <Link
                  href="/admin/dashboard"
                  className="px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground rounded-lg hover:bg-accent/50"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground rounded-lg hover:bg-accent/50"
                onClick={() => setIsOpen(false)}
              >
                Admin Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
