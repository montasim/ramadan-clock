"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin } from "lucide-react";

interface LocationSelectorProps {
  locations: string[];
  currentLocation?: string;
  className?: string;
}

export function LocationSelector({ locations, currentLocation, className }: LocationSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get the current location from URL params or use the provided currentLocation prop
  const selectedLocation = searchParams.get("location") || currentLocation || "Rangpur";

  const handleLocationChange = (value: string) => {
    // Create new URLSearchParams
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === "all") {
      params.delete("location");
    } else {
      params.set("location", value);
    }

    // Navigate to the same path with updated search params
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Select value={selectedLocation} onValueChange={handleLocationChange}>
      <SelectTrigger className={`w-[200px] bg-card/80 backdrop-blur border-border/60 shadow-sm ${className}`}>
        <MapPin className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
        <SelectValue placeholder="Select location" />
      </SelectTrigger>
      <SelectContent className="h-40 overflow-y-auto">
        <SelectItem value="all">All Locations</SelectItem>
        {locations.map((loc) => (
          <SelectItem key={loc} value={loc}>{loc}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
