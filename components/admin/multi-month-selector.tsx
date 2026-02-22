"use client";

import { MonthSelector, type MonthOption, type YearOption } from "./month-selector";

/**
 * Multi-Month Selector Component
 * Allows selecting multiple Gregorian months for prayer times fetching
 */

interface MultiMonthSelectorProps {
  year: number;
  selectedMonths: number[];
  onYearChange: (year: number) => void;
  onMonthToggle: (month: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  ramadanMonths?: number[];
  disabled?: boolean;
}

const MONTHS: MonthOption[] = [
  { value: 1, name: "January", days: 31 },
  { value: 2, name: "February", days: 28 },
  { value: 3, name: "March", days: 31 },
  { value: 4, name: "April", days: 30 },
  { value: 5, name: "May", days: 31 },
  { value: 6, name: "June", days: 30 },
  { value: 7, name: "July", days: 31 },
  { value: 8, name: "August", days: 31 },
  { value: 9, name: "September", days: 30 },
  { value: 10, name: "October", days: 31 },
  { value: 11, name: "November", days: 30 },
  { value: 12, name: "December", days: 31 },
];

const YEARS: YearOption[] = Array.from({ length: 11 }, (_, i) => ({
  value: 2025 + i,
  label: (2025 + i).toString(),
}));

export function MultiMonthSelector({
  year,
  selectedMonths,
  onYearChange,
  onMonthToggle,
  onSelectAll,
  onDeselectAll,
  ramadanMonths = [],
  disabled = false,
}: MultiMonthSelectorProps) {
  // Add Ramadan flag to months that are in ramadanMonths
  const monthsWithRamadan: MonthOption[] = MONTHS.map(month => ({
    ...month,
    isRamadan: ramadanMonths.includes(month.value),
  }));

  return (
    <MonthSelector
      title="Select Months"
      description="Choose months to fetch prayer times for"
      year={year}
      selectedMonths={selectedMonths}
      months={monthsWithRamadan}
      years={YEARS}
      onYearChange={onYearChange}
      onMonthToggle={onMonthToggle}
      onSelectAll={onSelectAll}
      onDeselectAll={onDeselectAll}
      disabled={disabled}
      showStatistics={true}
      yearLabel="Year"
      yearPlaceholder="Select year"
      totalDistricts={64}
    />
  );
}
