"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileJson, FileSpreadsheet } from "lucide-react";
import { exportPrayerTimes, type ExportEntry, calculateExportStats, generateFilename } from "@/lib/utils/export.utils";
import { toast } from "sonner";

/**
 * Export Button Component
 * Dropdown button for exporting prayer times to JSON or CSV format
 */

interface ExportButtonProps {
  data: ExportEntry[];
  disabled?: boolean;
  filename?: string;
  onExportStart?: () => void;
  onExportComplete?: () => void;
}

export function ExportButton({
  data,
  disabled = false,
  filename,
  onExportStart,
  onExportComplete,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportJSON = () => {
    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }

    setIsExporting(true);
    onExportStart?.();

    try {
      exportPrayerTimes({
        data,
        format: 'json',
        filename: filename || generateFilename('json'),
      });
      toast.success("Exported to JSON successfully");
      onExportComplete?.();
    } catch (error) {
      toast.error("Failed to export to JSON");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = () => {
    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }

    setIsExporting(true);
    onExportStart?.();

    try {
      exportPrayerTimes({
        data,
        format: 'csv',
        filename: filename || generateFilename('csv'),
      });
      toast.success("Exported to CSV successfully");
      onExportComplete?.();
    } catch (error) {
      toast.error("Failed to export to CSV");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const stats = calculateExportStats(data);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || isExporting || data.length === 0}
          className="rounded-full"
        >
          {isExporting ? (
            <span className="flex items-center gap-2">
              <Download className="h-4 w-4 animate-spin" />
              Exporting...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleExportJSON} disabled={isExporting}>
          <div className="flex items-center gap-2">
            <FileJson className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="font-medium">Export as JSON</p>
              <p className="text-xs text-muted-foreground">
                {stats.totalEntries.toLocaleString()} entries
              </p>
            </div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCSV} disabled={isExporting}>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-medium">Export as CSV</p>
              <p className="text-xs text-muted-foreground">
                {stats.totalEntries.toLocaleString()} entries
              </p>
            </div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
