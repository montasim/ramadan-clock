import { config } from "@/lib/config";
import { Github, Linkedin, Mail } from "lucide-react";
import moment from 'moment';

export function Footer() {
  const currentYear = moment().year();

  return (
    <footer className="relative border-t border-border/50 py-6 md:py-6">
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "var(--grad-primary)" }} />
      <div className="flex flex-col items-center justify-center gap-3 px-4">
        <div className="flex w-full max-w-5xl flex-col items-center justify-between gap-2 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {currentYear}{" "}
            <span className="gradient-text font-semibold">Ramadan Clock</span>.
            All rights reserved.
          </p>

          {/* Developer Social Icons */}
          <div className="flex items-center gap-5">
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
      </div>
    </footer>
  );
}
