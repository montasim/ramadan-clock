"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

/**
 * Month Selector Component
 * A reusable component for selecting multiple months (Gregorian or Hijri)
 */

export interface MonthOption {
  value: number;
  name: string;
  days?: number;
  isRamadan?: boolean;
}

export interface YearOption {
  value: number;
  label: string;
}

interface MonthSelectorProps {
  title?: string;
  description?: string;
  year: number;
  selectedMonths: number[];
  months: MonthOption[];
  years: YearOption[];
  onYearChange: (year: number) => void;
  onMonthToggle: (month: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  disabled?: boolean;
  showStatistics?: boolean;
  yearLabel?: string;
  yearPlaceholder?: string;
  totalDistricts?: number;
}

export function MonthSelector({
  title = "Select Months",
  description = "Choose months to fetch prayer times for",
  year,
  selectedMonths,
  months,
  years,
  onYearChange,
  onMonthToggle,
  onSelectAll,
  onDeselectAll,
  disabled = false,
  showStatistics = true,
  yearLabel = "Year",
  yearPlaceholder = "Select year",
  totalDistricts = 64,
}: MonthSelectorProps) {
  const [isAllSelected, setIsAllSelected] = useState(false);

  // Calculate total days for selected months (only if days property exists)
  const totalDays = useMemo(() => {
    return selectedMonths.reduce((sum, month) => {
      const monthData = months.find(m => m.value === month);
      return sum + (monthData?.days || 0);
    }, 0);
  }, [selectedMonths, months]);

  // Calculate estimated entries (days × districts)
  const estimatedEntries = totalDays * totalDistricts;

  // Check if all months are selected
  useMemo(() => {
    const allSelected = selectedMonths.length === months.length;
    setIsAllSelected(allSelected);
  }, [selectedMonths, months.length]);

  const handleSelectAll = () => {
    months.forEach(month => {
      if (!selectedMonths.includes(month.value)) {
        onMonthToggle(month.value);
      }
    });
    onSelectAll();
  };

  const handleDeselectAll = () => {
    selectedMonths.forEach(month => {
      onMonthToggle(month);
    });
    onDeselectAll();
  };

  return (
    <Card className="border-primary/30 overflow-hidden shadow-sm bg-primary/5 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Year Selector */}
        <div className="space-y-2">
          <Label htmlFor="year-select" className="text-sm font-semibold">{yearLabel}</Label>
          <div className="flex gap-2">
            <Select
              value={year.toString()}
              onValueChange={(value) => onYearChange(parseInt(value, 10))}
              disabled={disabled}
            >
              <SelectTrigger className="flex-1 h-10 rounded-xl border-border/60 bg-background">
                <SelectValue placeholder={yearPlaceholder} />
                <SelectContent position="popper">
                  {years.map((y) => (
                    <SelectItem key={y.value} value={y.value.toString()}>
                      {y.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectTrigger>
            </Select>
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
              disabled={disabled || selectedMonths.length === 0}
              className="rounded-full px-3"
            >
              Deselect All
            </Button>
          </div>
        </div>

        {/* Months Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {months.map((month) => {
            const isSelected = selectedMonths.includes(month.value);
            const isRamadan = month.isRamadan;

            return (
              <div
                key={month.value}
                className={`
                  flex items-center justify-center gap-2 p-2 rounded-xl border transition-all duration-200 text-center
                  ${isSelected
                    ? 'border-primary bg-primary/10 cursor-pointer hover:bg-primary/20'
                    : 'border-border/60 hover:border-primary/40 hover:bg-primary/5 cursor-pointer'
                  }
                  ${isRamadan && isSelected ? 'bg-green-500/20 border-green-500/50' : ''}
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onClick={() => !disabled && onMonthToggle(month.value)}
              >
                <Checkbox
                  id={`month-${month.value}`}
                  checked={isSelected}
                  className="pointer-events-none mb-1 data-[state=unchecked]:border-primary border-primary"
                />
                <span className="text-xs font-medium">{month.name}</span>
                {isRamadan && (
                  <Badge className="text-[9px] px-1 py-0 mt-1 bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30">
                    Ramadan
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
