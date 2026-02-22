/**
 * No Schedule Card Component
 * Displays when there are no schedule entries, with a button to upload
 */

"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Upload } from "lucide-react";

export function NoScheduleCard() {
  return (
    <div className="text-center py-14 text-muted-foreground">
      <p className="mb-4">No schedule entries yet.</p>
      <div className="flex justify-center">
        <Link href="/admin/import" className="w-full sm:w-auto">
          <Button className="btn-gradient rounded-full gap-2 font-semibold w-full sm:w-auto">
            <Upload className="h-4 w-4" />
            Upload Schedule
          </Button>
        </Link>
      </div>
    </div>
  );
}
