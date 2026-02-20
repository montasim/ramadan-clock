import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { Toaster } from "@/components/ui/sonner";
import { getBaseMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/json-ld";
import { createWebSiteSchema } from "@/lib/seo/schemas";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = getBaseMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <JsonLd data={createWebSiteSchema()} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-screen flex-col bg-saas`}
      >
        <Providers>
          {/* Decorative background blobs — encapsulated to prevent overflow */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
            <div
              className="blob"
              style={{
                width: "700px",
                height: "700px",
                top: "-200px",
                left: "-200px",
                background: "var(--blob-blue)",
                opacity: 0.07,
              }}
            />
            <div
              className="blob"
              style={{
                width: "600px",
                height: "600px",
                bottom: "-150px",
                right: "-150px",
                background: "var(--blob-purple)",
                opacity: 0.07,
              }}
            />
            <div
              className="blob"
              style={{
                width: "400px",
                height: "400px",
                top: "40%",
                right: "0",
                background: "var(--blob-blue)",
                opacity: 0.04,
              }}
            />
          </div>
          <Header />
          <main className="flex-1 relative z-10">{children}</main>
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
