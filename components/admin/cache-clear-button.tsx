"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { clearAllCache } from "@/actions/cache.actions";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

export function CacheClearButton() {
  const [isClearing, setIsClearing] = useState(false);

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      const result = await clearAllCache();

      if (result?.success) {
        toast.success(result.data?.message || "Cache cleared successfully");
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        toast.error(result?.error?.message || "Failed to clear cache");
      }
    } catch (error) {
      console.error("Error clearing cache:", error);
      toast.error("An unexpected error occurred while clearing cache");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClearCache}
      disabled={isClearing}
      className="rounded-full gap-2 border-border/60 hover:border-primary/50 hover:text-primary"
    >
      <RefreshCw className={`h-3.5 w-3.5 ${isClearing ? "animate-spin" : ""}`} />
      {isClearing ? "Clearing..." : "Clear Cache"}
    </Button>
  );
}
