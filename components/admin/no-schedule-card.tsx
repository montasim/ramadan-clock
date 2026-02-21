/**
 * No Schedule Card Component
 * Displays when there are no schedule entries, with buttons to upload or update
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Upload, RefreshCw } from "lucide-react";
import { triggerCronJob } from "@/actions/cron";
import { toast } from "sonner";

export function NoScheduleCard() {
  const [triggering, setTriggering] = useState(false);

  const handleTrigger = async () => {
    setTriggering(true);
    try {
      const result = await triggerCronJob();
      if (result.success) {
        toast.success("Prayer time update triggered successfully");
        // Reload the page after a short delay to show updated data
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error(result.error || "Failed to trigger update");
      }
    } catch (error) {
      console.error("Error triggering cron job:", error);
      toast.error("Failed to trigger update");
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="text-center py-14 text-muted-foreground">
      <p className="mb-4">No schedule entries yet.</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/admin/upload" className="w-full sm:w-auto">
          <Button className="btn-gradient rounded-full gap-2 font-semibold w-full sm:w-auto">
            <Upload className="h-4 w-4" />
            Upload Schedule
          </Button>
        </Link>
        <Button
          onClick={handleTrigger}
          disabled={triggering}
          className="btn-gradient rounded-full gap-2 font-semibold w-full sm:w-auto"
        >
          {triggering ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Update Now
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
