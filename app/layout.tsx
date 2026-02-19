import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ramadan Clock - Sehri & Iftar Times",
  description: "View Sehri and Iftar times for Ramadan. Download schedules, view by location, and stay on track during the holy month.",
  keywords: ["Ramadan", "Sehri", "Iftar", "Islamic", "Prayer Times", "Muslim"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex min-h-screen flex-col bg-saas`}
      >
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
      </body>
    </html>
  );
}
