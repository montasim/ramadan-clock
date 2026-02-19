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
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
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
