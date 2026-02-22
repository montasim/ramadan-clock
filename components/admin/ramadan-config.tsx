"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Save, RefreshCw } from "lucide-react";
import { updateRamadanSettings, getRamadanSettings } from "@/actions/ramadan-settings.actions";
import { toast } from "sonner";

export function RamadanConfig() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    const result = await getRamadanSettings();
    if (result.success) {
      setStartDate(result.startDate || "");
      setEndDate(result.endDate || "");
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateRamadanSettings(startDate, endDate);
    setIsSaving(false);
    
    if (result.success) {
      toast.success("Ramadan dates updated successfully");
    } else {
      toast.error(result.error || "Failed to update Ramadan dates");
    }
  };

  return (
    <Card className="border-primary/30 overflow-hidden shadow-sm bg-primary/5 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
        <div>
          <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Ramadan Configuration
          </CardTitle>
          <CardDescription className="text-xs mt-1">
            Set Ramadan start and end dates for status determination
          </CardDescription>
        </div>
        <div className="p-2 rounded-lg bg-primary/10">
          <Calendar className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="ramadan-start" className="text-sm font-semibold">
              Ramadan Start Date
            </Label>
            <Input
              id="ramadan-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isLoading || isSaving}
              className="h-10 rounded-xl border-border/60"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="ramadan-end" className="text-sm font-semibold">
              Ramadan End Date
            </Label>
            <Input
              id="ramadan-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isLoading || isSaving}
              className="h-10 rounded-xl border-border/60"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="btn-gradient rounded-full gap-2 font-semibold flex-1"
            >
              {isSaving ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? "Saving..." : "Save Dates"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
