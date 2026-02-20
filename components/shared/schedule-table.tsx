"use client";

import { TimeEntry } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getScheduleStatus, getScheduleRowClass, ScheduleStatus } from "@/lib/utils/schedule.utils";
import { Pencil, Trash2 } from "lucide-react";
import moment from 'moment';

export interface ScheduleTableProps {
  entries: TimeEntry[];
  showLocation?: boolean;
  showStatus?: boolean;
  showTodayBadge?: boolean;
  rowClassVariant?: "full" | "simple";
  // Admin mode props
  editable?: boolean;
  selectedIds?: Set<string>;
  onSelectAll?: (checked: boolean) => void;
  onSelectOne?: (id: string, checked: boolean) => void;
  onEdit?: (entry: TimeEntry) => void;
  onDelete?: (entry: TimeEntry) => void;
  isAllSelected?: boolean;
}

/**
 * Status Badge Component
 */
function StatusBadge({ status }: { status: ScheduleStatus }) {
  switch (status) {
    case "passed":
      return (
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30">
          Passed
        </Badge>
      );
    case "today":
      return (
        <Badge className="text-[10px] px-1.5 py-0 bg-primary/20 text-primary hover:bg-primary/30 border-primary/30">
          Today
        </Badge>
      );
    case "tomorrow":
      return (
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-500/40 text-amber-600 dark:text-amber-400">
          Tomorrow
        </Badge>
      );
    case "upcoming":
      return (
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/40 text-primary">
          Upcoming
        </Badge>
      );
  }
}

/**
 * Today Badge Component
 */
function TodayBadge() {
  return (
    <span
      className="w-fit text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded-full text-white font-bold mt-1"
      style={{ background: "var(--grad-primary)" }}
    >
      TODAY
    </span>
  );
}

/**
 * Schedule Table Component
 *
 * A reusable table component for displaying Sehri & Iftar schedules.
 *
 * @param entries - Array of TimeEntry objects to display
 * @param showLocation - Whether to show the location column (default: true)
 * @param showStatus - Whether to show the status column (default: true)
 * @param showTodayBadge - Whether to show TODAY badge for today's entry (default: true)
 * @param rowClassVariant - Row styling variant: "full" (with border-l) or "simple" (without) (default: "full")
 * @param editable - Whether to show edit/delete actions (default: false)
 * @param selectedIds - Set of selected entry IDs for bulk operations
 * @param onSelectAll - Callback for select all checkbox
 * @param onSelectOne - Callback for individual entry checkbox
 * @param onEdit - Callback for edit action
 * @param onDelete - Callback for delete action
 * @param isAllSelected - Whether all entries are selected
 */
export function ScheduleTable({
  entries,
  showLocation = true,
  showStatus = true,
  showTodayBadge = true,
  rowClassVariant = "full",
  editable = false,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onEdit,
  onDelete,
  isAllSelected = false,
}: ScheduleTableProps) {
  // Use moment to get today's date in ISO format
  const today = moment().format('YYYY-MM-DD');

  return (
    <div className="relative overflow-x-auto rounded-xl border border-border/40 bg-primary/5">
      <Table className="min-w-[600px] sm:min-w-full">
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border/50">
            {editable && (
              <TableHead className="w-[40px] px-3">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={onSelectAll}
                  aria-label="Select all"
                  className="border-primary/40 hidden sm:inline-flex"
                />
              </TableHead>
            )}
            <TableHead className="pl-4 sm:pl-6 w-[140px] sm:w-[180px]">Date</TableHead>
            <TableHead className="px-2 sm:px-4">Sehri</TableHead>
            <TableHead className="px-2 sm:px-4">Iftar</TableHead>
            {showLocation && (
              <TableHead className="px-2 sm:px-4">Location</TableHead>
            )}
            {showStatus && (
              <TableHead className="text-center px-2 sm:px-4 hidden md:table-cell">Status</TableHead>
            )}
            {editable && (
              <TableHead className="text-right px-3 sm:px-4">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => {
            const isToday = entry.date === today;
            const isSelected = selectedIds?.has(entry.id) ?? false;
            const { status, rowClass } = getScheduleStatus(entry, entries);
            
            // Use simple row class for location page
            const finalRowClass = rowClassVariant === "simple"
              ? getScheduleRowClass(entry, entries)
              : rowClass;

            return (
              <TableRow
                key={entry.id}
                className={finalRowClass}
              >
                {editable && (
                  <TableCell className="px-3">
                    <Checkbox
                    className="border-primary/40"
                      checked={isSelected}
                      onCheckedChange={(c) => onSelectOne?.(entry.id, c as boolean)}
                      aria-label={`Select entry for ${entry.date}`}
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium pl-4 sm:pl-6 py-3 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm">
                      {moment(entry.date).format("MMM D, YYYY")}
                    </span>
                    {showTodayBadge && isToday && <TodayBadge />}
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-amber-600 dark:text-amber-400 px-2 sm:px-4">
                  {entry.sehri}
                </TableCell>
                <TableCell className="font-semibold text-violet-600 dark:text-violet-400 px-2 sm:px-4">
                  {entry.iftar}
                </TableCell>
                {showLocation && (
                  <TableCell className="text-muted-foreground text-xs sm:text-sm px-2 sm:px-4">
                    {entry.location || "—"}
                  </TableCell>
                )}
                {showStatus && (
                  <TableCell className="text-center px-2 sm:px-4 hidden md:table-cell">
                    <StatusBadge status={status} />
                  </TableCell>
                )}
                {editable && (
                  <TableCell className="text-right px-3 sm:px-4">
                    <div className="flex justify-end gap-1 sm:gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg bg-primary/10 text-primary/50 hover:bg-primary/20 hover:text-primary transition-colors"
                        onClick={() => onEdit?.(entry)}
                        title="Edit entry"
                      >
                        <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg bg-destructive/10 text-destructive/50 hover:bg-destructive/20 hover:text-destructive transition-colors"
                        onClick={() => onDelete?.(entry)}
                        title="Delete entry"
                      >
                        <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
