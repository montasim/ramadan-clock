"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface DownloadButtonProps {
  location?: string | null;
  type?: "today" | "full";
  className?: string;
}

export function DownloadButton({ location, type = "today", className }: DownloadButtonProps) {
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const params = new URLSearchParams();
      if (location) params.set("location", location);
      params.set("type", type);

      const response = await fetch(`/api/pdf?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const locationPart = location ? `-${location.toLowerCase().replace(/\s+/g, "-")}` : "";
      const year = new Date().getFullYear();
      link.download = `sehri-iftar${locationPart}-${year}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      // Fallback: open in new tab
      const params = new URLSearchParams();
      if (location) params.set("location", location);
      params.set("type", type);
      window.open(`/api/pdf?${params.toString()}`, "_blank");
    }
  };

  return (
    <Button variant="outline" size="icon" onClick={handleDownload} className={className}>
      <Download className="h-4 w-4" />
    </Button>
  );
}
