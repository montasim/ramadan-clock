import { config } from "@/lib/config";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Github, Linkedin, Mail, ExternalLink, User, Code2 } from "lucide-react";
import { getContactMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/json-ld";
import { createWebPageSchema, createBreadcrumbSchema, createOrganizationSchema } from "@/lib/seo/schemas";

export const metadata = getContactMetadata();

export default function ContactPage() {
  const siteUrl = process.env.NEXTAUTH_URL || 'https://ramadanclock.com';
  
  return (
    <>
      <JsonLd data={createWebPageSchema({
        name: 'Contact - Ramadan Clock Open Source Project',
        description: 'Get in touch with the Ramadan Clock team. Learn about this open source project built with Next.js, Prisma, and PostgreSQL.',
        url: `${siteUrl}/contact`,
      })} />
      <JsonLd data={createOrganizationSchema({
        logo: `${siteUrl}/logo.png`,
        sameAs: [
          config.projectRepoUrl,
          config.developerGithub,
          config.developerLinkedin,
        ],
        description: 'Open source Ramadan prayer times application',
      })} />
      <JsonLd data={createBreadcrumbSchema([
        { name: 'Home', url: siteUrl },
        { name: 'Contact', url: `${siteUrl}/contact` },
      ])} />
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
        <Card className="card-hover-lift border-primary/30 bg-primary/5 backdrop-blur-sm">
          <div className="p-6 space-y-6">
            {/* Icon Section */}
            <div className="flex items-start justify-between">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                Open Source
              </Badge>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold">Project Information</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Open source Ramadan Clock project
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                <p className="text-sm text-muted-foreground">
                  A web application to track Sehri and Iftar times during Ramadan. 
                  Built with Next.js, Prisma, and PostgreSQL.
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <Button asChild variant="outline" className="w-full" size="lg">
              <a href={config.projectRepoUrl} target="_blank" rel="noopener noreferrer">
                <Github className="h-5 w-5 mr-2" />
                View on GitHub
                <ExternalLink className="h-4 w-4 ml-auto" />
              </a>
            </Button>
          </div>
        </Card>

        {/* Developer Info Card */}
        <Card className="card-hover-lift border-primary/30 bg-primary/5 backdrop-blur-sm">
          <div className="p-6 space-y-6">
            {/* Profile Section */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <User className="h-10 w-10 text-primary" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold">{config.developerName}</h3>
                <p className="text-sm text-muted-foreground">{config.developerBio}</p>
              </div>
            </div>

            {/* Social Links Grid */}
            <div className="grid grid-cols-3 gap-3">
              <a 
                href={config.developerGithub} 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link-btn group"
                title="GitHub"
              >
                <Github className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>

              <a 
                href={config.developerLinkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link-btn group"
                title="LinkedIn"
              >
                <Linkedin className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>

              <a 
                href={`mailto:${config.developerEmail}`}
                className="social-link-btn group"
                title="Email"
              >
                <Mail className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            </div>

            {/* Contact CTA */}
            <Button asChild variant="outline" className="w-full">
              <a href={`mailto:${config.developerEmail}`}>
                <Mail className="h-4 w-4 mr-2" />
                Get in Touch
              </a>
            </Button>
          </div>
        </Card>
      </div>
    </div>
    </>
  );
}
