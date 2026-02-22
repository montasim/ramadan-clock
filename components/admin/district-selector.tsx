"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

/**
 * District Selector Component
 * A reusable component for selecting multiple districts
 */

export interface DistrictOption {
  value: string;
  name: string;
  division?: string;
}

interface DistrictSelectorProps {
  title?: string;
  description?: string;
  selectedDistricts: string[];
  districts: DistrictOption[];
  onDistrictToggle: (district: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  disabled?: boolean;
  showStatistics?: boolean;
  maxDisplayHeight?: string;
}

export function DistrictSelector({
  title = "Select Districts",
  description = "Choose districts to fetch prayer times for",
  selectedDistricts,
  districts,
  onDistrictToggle,
  onSelectAll,
  onDeselectAll,
  disabled = false,
  showStatistics = true,
  maxDisplayHeight = "300px",
}: DistrictSelectorProps) {
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter districts based on search query
  const filteredDistricts = useMemo(() => {
    if (!searchQuery) return districts;
    const query = searchQuery.toLowerCase();
    return districts.filter(
      district =>
        district.name.toLowerCase().includes(query) ||
        district.division?.toLowerCase().includes(query)
    );
  }, [districts, searchQuery]);

  // Check if all districts are selected
  useMemo(() => {
    const allSelected = selectedDistricts.length === districts.length;
    setIsAllSelected(allSelected);
  }, [selectedDistricts, districts.length]);

  const handleSelectAll = () => {
    districts.forEach(district => {
      if (!selectedDistricts.includes(district.value)) {
        onDistrictToggle(district.value);
      }
    });
    onSelectAll();
  };

  const handleDeselectAll = () => {
    selectedDistricts.forEach(district => {
      onDistrictToggle(district);
    });
    onDeselectAll();
  };

  // Group districts by division for better organization
  const districtsByDivision = useMemo(() => {
    const groups: Record<string, DistrictOption[]> = {};
    filteredDistricts.forEach(district => {
      const division = district.division || "Other";
      if (!groups[division]) {
        groups[division] = [];
      }
      groups[division].push(district);
    });
    return groups;
  }, [filteredDistricts]);

  return (
    <Card className="border-primary/30 overflow-hidden shadow-sm bg-primary/5 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input and Action Buttons */}
        <div className="space-y-2">
          <Label htmlFor="district-search" className="text-sm font-semibold">Search Districts</Label>
          <div className="flex items-center gap-2">
            <input
              id="district-search"
              type="text"
              placeholder="Search by district name or division..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={disabled}
              className="flex-1 h-10 px-3 rounded-xl border border-border/60 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={disabled || isAllSelected}
              className="rounded-full px-3"
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeselectAll}
              disabled={disabled || selectedDistricts.length === 0}
              className="rounded-full px-3"
            >
              Deselect All
            </Button>
          </div>
        </div>

        {/* Districts Grid */}
        <div 
          className="space-y-4 overflow-y-auto pr-2"
          style={{ maxHeight: maxDisplayHeight }}
        >
          {Object.entries(districtsByDivision).map(([division, divisionDistricts]) => (
            <div key={division} className="space-y-2">
              {division !== "Other" && (
                <div className="flex items-center gap-2">
                  <Badge className="text-[10px] px-2 py-0 bg-primary/20 text-primary border-primary/30">
                    {division}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    ({divisionDistricts.length} district{divisionDistricts.length !== 1 ? 's' : ''})
                  </span>
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {divisionDistricts.map((district) => {
                  const isSelected = selectedDistricts.includes(district.value);

                  return (
                    <div
                      key={district.value}
                      className={`
                        flex items-center justify-center gap-2 p-2 rounded-xl border transition-all duration-200 text-center
                        ${isSelected
                          ? 'border-primary bg-primary/10 cursor-pointer hover:bg-primary/20'
                          : 'border-border/60 hover:border-primary/40 hover:bg-primary/5 cursor-pointer'
                        }
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                      onClick={() => !disabled && onDistrictToggle(district.value)}
                    >
                      <Checkbox
                        id={`district-${district.value}`}
                        checked={isSelected}
                        className="pointer-events-none mb-1 data-[state=unchecked]:border-primary border-primary"
                      />
                      <span className="text-xs font-medium truncate">{district.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
