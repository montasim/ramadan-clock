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
    <footer className="relative border-t border-border/50 py-6 md:py-6">
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "var(--grad-primary)" }} />
      <div className="flex flex-col items-center justify-center gap-3 px-4">
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
