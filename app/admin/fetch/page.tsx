"use client";

import { useState, useCallback } from "react";
import { useProgress } from "@/hooks/use-progress";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AppModal } from "@/components/ui/app-modal";
import { ProgressBar, type ProgressData } from "@/components/ui/progress-bar";
import { ScheduleCard } from "@/components/shared/schedule-card";
import { ScheduleTable } from "@/components/shared/schedule-table";
import { MultiMonthSelector } from "@/components/admin/multi-month-selector";
import { MonthSelector, type MonthOption, type YearOption } from "@/components/admin/month-selector";
import { DistrictSelector } from "@/components/admin/district-selector";
import { ExportButton } from "@/components/admin/export-button";
import { RateLimitConfig } from "@/components/admin/rate-limit-config";
import { CacheClearButton } from "@/components/admin/cache-clear-button";
import { PageHero } from "@/components/shared/page-hero";
import { DashboardGuard } from "@/lib/guards";
import { Cloud, Calendar, CalendarDays, Moon, RefreshCw, AlertCircle, CheckCircle2, Upload, Download } from "lucide-react";
import type { RateLimitConfig as RateLimitConfigType } from "@/lib/api/aladhan-api-wrapper";
import { toast } from "sonner";
import { BANGLADESH_DISTRICTS, BANGLADESH_DISTRICTS_WITH_DIVISION } from "@/lib/config/locations.config";
import type { AladhanPrayerTimes } from "@/lib/api/aladhan-api-wrapper";
import { RATE_LIMIT_PRESETS } from "@/lib/config/app.config";
import { cn } from "@/lib/utils";

// Admin pages should never be cached - they need real-time data
export const dynamic = 'force-dynamic';

const MONTHS = [
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

const HIJRI_MONTHS: MonthOption[] = [
  { value: 1, name: "Muharram" },
  { value: 2, name: "Safar" },
  { value: 3, name: "Rabi al-Awwal" },
  { value: 4, name: "Rabi al-Thani" },
  { value: 5, name: "Jumada al-Awwal" },
  { value: 6, name: "Jumada al-Thani" },
  { value: 7, name: "Rajab" },
  { value: 8, name: "Sha'ban" },
  { value: 9, name: "Ramadan", isRamadan: true },
  { value: 10, name: "Shawwal" },
  { value: 11, name: "Dhu al-Qi'dah" },
  { value: 12, name: "Dhu al-Hijjah" },
];

const HIJRI_YEARS: YearOption[] = Array.from({ length: 20 }, (_, i) => ({
  value: 1440 + i,
  label: `${1440 + i} AH`,
}));

export default function ApiFetchPage() {
  const router = useRouter();
  
  // Fetch mode state
  const [fetchMode, setFetchMode] = useState<'dateRange' | 'multiMonth' | 'hijriMonth'>('dateRange');
  
  // Date range mode state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Multi-month mode state
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  
  // Hijri month mode state
  const [hijriYear, setHijriYear] = useState(1446);
  const [selectedHijriMonths, setSelectedHijriMonths] = useState<number[]>([9]); // Default: Ramadan
  
  // District selection state
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  
  // Fetch state
  const [isFetching, setIsFetching] = useState(false);
  const [fetchProgress, setFetchProgress] = useState<ProgressData | null>(null);
  const [fetchedData, setFetchedData] = useState<AladhanPrayerTimes[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchOperationId, setFetchOperationId] = useState<string | null>(null);
  const fetchProgressData = useProgress(fetchOperationId);
  
  // Debug: Log when fetch progress data arrives
  if (fetchProgressData.progress) {
    console.log('Fetch progress update:', {
      current: fetchProgressData.progress.current,
      total: fetchProgressData.progress.total,
      percentage: fetchProgressData.progress.percentage,
      status: fetchProgressData.progress.status,
      isConnected: fetchProgressData.isConnected,
    });
  }
  
  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadOperationId, setUploadOperationId] = useState<string | null>(null);
  const uploadProgressData = useProgress(uploadOperationId);
  
  // Debug: Log when upload progress data arrives
  if (uploadProgressData.progress) {
    console.log('Upload progress update:', {
      current: uploadProgressData.progress.current,
      total: uploadProgressData.progress.total,
      percentage: uploadProgressData.progress.percentage,
      status: uploadProgressData.progress.status,
      isConnected: uploadProgressData.isConnected,
    });
  }
  const [uploadResult, setUploadResult] = useState<{ success: boolean; rowCount?: number; message?: string } | null>(null);
  const [showUploadConfirm, setShowUploadConfirm] = useState(false);
  
  // Preview state
  const [selectedPreviewDistrict, setSelectedPreviewDistrict] = useState<string>('all');
  const [previewPage, setPreviewPage] = useState(1);
  
  // Rate limit configuration state
  const [rateLimitConfig, setRateLimitConfig] = useState<RateLimitConfigType>(
    RATE_LIMIT_PRESETS.fast
  );

  // Calculate total days and estimated entries for multi-month mode
  const totalDays = selectedMonths.reduce((sum, month) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    return sum + daysInMonth;
  }, 0);
  
  const estimatedEntries = totalDays * (selectedDistricts.length > 0 ? selectedDistricts.length : BANGLADESH_DISTRICTS.length);
  const dateRangeEntries = startDate && endDate ? 
    Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1 : 0;
  
  const handleFetch = async () => {
    if (fetchMode === 'dateRange' && (!startDate || !endDate)) {
      toast.error("Please select both start and end dates");
      return;
    }
    
    if (fetchMode === 'multiMonth' && selectedMonths.length === 0) {
      toast.error("Please select at least one month");
      return;
    }
    
    if (fetchMode === 'hijriMonth' && selectedHijriMonths.length === 0) {
      toast.error("Please select at least one Hijri month");
      return;
    }

    setIsFetching(true);
    setFetchError(null);
    setFetchedData([]);

    // Calculate total entries for progress tracking
    const totalEntries = estimatedEntries || dateRangeEntries * (selectedDistricts.length > 0 ? selectedDistricts.length : BANGLADESH_DISTRICTS.length);

    try {
      // Step 1: Create progress operation BEFORE fetching
      const createResponse = await fetch('/api/progress/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'fetch',
          total: totalEntries,
        }),
      });

      const createResult = await createResponse.json();
      if (!createResult.id) {
        throw new Error('Failed to create progress operation');
      }

      // Step 2: Start listening to progress updates immediately
      setFetchOperationId(createResult.id);

      // Step 3: Wait for SSE connection to establish (longer delay for production)
      await new Promise(resolve => setTimeout(resolve, 500));

      const params = new URLSearchParams();
      params.append('mode', fetchMode);
      params.append('operationId', createResult.id); // Pass operationId to API
      
      if (fetchMode === 'dateRange') {
        params.append('startDate', startDate);
        params.append('endDate', endDate);
      } else if (fetchMode === 'multiMonth') {
        params.append('year', year.toString());
        params.append('months', selectedMonths.join(','));
      } else if (fetchMode === 'hijriMonth') {
        params.append('hijriYear', hijriYear.toString());
        params.append('hijriMonths', selectedHijriMonths.join(','));
      }
      
      if (selectedDistricts.length > 0) {
        params.append('districts', selectedDistricts.join(','));
      }
      
      // Add rate limit configuration
      params.append('rateLimitConfig', JSON.stringify(rateLimitConfig));

      const response = await fetch(`/api/prayer-times/fetch?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch prayer times');
      }

      setFetchedData(result.data.entries);
      toast.success(`Fetched ${result.data.meta.totalEntries.toLocaleString()} prayer times for ${result.data.meta.totalDistricts} districts`);
      
      // Cache the data for preview
      await fetch('/api/prayer-times/preview/cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries: result.data.entries,
          district: selectedDistricts.length > 0 ? 'custom' : 'all',
        }),
      });
      
    } catch (error) {
      console.error('Fetch error:', error);
      setFetchError(error instanceof Error ? error.message : 'Failed to fetch prayer times');
      toast.error("Failed to fetch prayer times");
    } finally {
      setIsFetching(false);
    }
  };

  const handleUpload = async () => {
    setIsUploading(true);
    setShowUploadConfirm(false);
    setUploadOperationId(null);

    try {
      // Step 1: Create progress operation
      const createResponse = await fetch('/api/progress/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'upload',
          total: fetchedData.length,
        }),
      });

      const createResult = await createResponse.json();
      if (!createResult.id) {
        throw new Error('Failed to create progress operation');
      }

      // Step 2: Start listening to progress updates
      setUploadOperationId(createResult.id);

      // Step 3: Wait for SSE connection to establish (longer delay for production)
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 4: Upload with operation ID
      const uploadResponse = await fetch('/api/schedule/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries: fetchedData.map(entry => ({
            date: entry.date,
            sehri: entry.sehri,
            iftar: entry.iftar,
            location: entry.location,
          })),
          fileName: `aladhan-fetch-${new Date().toISOString().split('T')[0]}.json`,
          operationId: createResult.id,
        }),
      });

      const uploadResult = await uploadResponse.json();
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error?.message || 'Failed to upload');
      }

      setUploadResult({
        success: true,
        rowCount: uploadResult.data?.rowCount,
        message: uploadResult.data?.message,
      });
      
      toast.success(`Successfully uploaded ${uploadResult.data?.rowCount?.toLocaleString()} entries`);
      
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to upload',
      });
      toast.error("Failed to upload prayer times");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearData = () => {
    setFetchedData([]);
    setFetchProgress(null);
    setFetchError(null);
    setUploadResult(null);
    setSelectedPreviewDistrict('all');
    setPreviewPage(1);
    
    // Clear preview cache
    fetch('/api/prayer-times/preview/cache', { method: 'DELETE' })
      .then(() => toast.success("Preview data cleared"))
      .catch(() => toast.error("Failed to clear preview data"));
  };

  

  // Filter preview data by selected district
  const previewData = selectedPreviewDistrict === 'all' 
    ? fetchedData 
    : fetchedData.filter(entry => entry.location === selectedPreviewDistrict);

  return (
    <DashboardGuard>
      <div className="w-full max-w-5xl mx-auto py-10 px-4 space-y-8">
      <PageHero
        subtitle="✦ Admin Panel"
        title={<>API <span className="gradient-text">Fetch</span></>}
        description="Fetch Sehri & Iftar schedules from Aladhan API"
        actions={<CacheClearButton />}
      />

      {/* ── Fetch Configuration ──────────────────────── */}
      <Card className="border-primary/30 overflow-hidden shadow-sm bg-primary/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Cloud className="h-4 w-4 text-primary" />
            Fetch Configuration
          </CardTitle>
          <CardDescription>Configure your prayer times fetch request</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Fetch Mode Tabs */}
          <Tabs value={fetchMode} onValueChange={(value) => setFetchMode(value as 'dateRange' | 'multiMonth' | 'hijriMonth')} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dateRange" className="rounded-full text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                Date Range
              </TabsTrigger>
              <TabsTrigger value="multiMonth" className="rounded-full text-xs">
                <CalendarDays className="h-3 w-3 mr-1" />
                Multi-Month
              </TabsTrigger>
              <TabsTrigger value="hijriMonth" className="rounded-full text-xs">
                <Moon className="h-3 w-3 mr-1" />
                Hijri Month
              </TabsTrigger>
            </TabsList>

            {/* Date Range Mode */}
            <TabsContent value="dateRange" className="space-y-4 mt-4">
              {/* Summary Card */}
              <Card className="border-primary/30 overflow-hidden shadow-sm bg-primary/5 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {/* Selected Months */}
                    <div className="py-3 px-3 rounded-xl border border-border/40 bg-muted/30">
                      <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Selected Months</p>
                      <p className="text-xl sm:text-2xl font-bold gradient-text">N/A</p>
                    </div>
                    
                    {/* Total Days */}
                    {dateRangeEntries > 0 && (
                      <div className="py-3 px-3 rounded-xl border border-border/40 bg-muted/30">
                        <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Total Days</p>
                        <p className="text-xl sm:text-2xl font-bold gradient-text">{dateRangeEntries}</p>
                      </div>
                    )}
                    
                    {/* Est. Entries */}
                    <div className="py-3 px-3 rounded-xl border border-primary/30 bg-primary/10">
                      <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Est. Entries</p>
                      <p className="text-xl sm:text-2xl font-bold text-primary">
                        {(dateRangeEntries * (selectedDistricts.length > 0 ? selectedDistricts.length : BANGLADESH_DISTRICTS.length)).toLocaleString()}
                      </p>
                    </div>
                    
                    {/* Selected Districts */}
                    <div className="py-3 px-3 rounded-xl border border-border/40 bg-muted/30">
                      <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Selected Districts</p>
                      <p className="text-xl sm:text-2xl font-bold gradient-text">{selectedDistricts.length}</p>
                    </div>
                    
                    {/* Total Districts */}
                    <div className="py-3 px-3 rounded-xl border border-border/40 bg-muted/30">
                      <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Total Districts</p>
                      <p className="text-xl sm:text-2xl font-bold gradient-text">{BANGLADESH_DISTRICTS.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-10 rounded-xl border-border/60"
                    disabled={isFetching}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-10 rounded-xl border-border/60"
                    disabled={isFetching}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Multi-Month Mode */}
            <TabsContent value="multiMonth" className="space-y-4 mt-4">
              {/* Summary Card */}
              <Card className="border-primary/30 overflow-hidden shadow-sm bg-primary/5 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {/* Selected Months */}
                    <div className="py-3 px-3 rounded-xl border border-border/40 bg-muted/30">
                      <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Selected Months</p>
                      <p className="text-xl sm:text-2xl font-bold gradient-text">{selectedMonths.length}</p>
                    </div>
                    
                    {/* Total Days */}
                    {totalDays > 0 && (
                      <div className="py-3 px-3 rounded-xl border border-border/40 bg-muted/30">
                        <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Total Days</p>
                        <p className="text-xl sm:text-2xl font-bold gradient-text">{totalDays}</p>
                      </div>
                    )}
                    
                    {/* Est. Entries */}
                    <div className="py-3 px-3 rounded-xl border border-primary/30 bg-primary/10">
                      <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Est. Entries</p>
                      <p className="text-xl sm:text-2xl font-bold text-primary">
                        {(totalDays * (selectedDistricts.length > 0 ? selectedDistricts.length : BANGLADESH_DISTRICTS.length)).toLocaleString()}
                      </p>
                    </div>
                    
                    {/* Selected Districts */}
                    <div className="py-3 px-3 rounded-xl border border-border/40 bg-muted/30">
                      <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Selected Districts</p>
                      <p className="text-xl sm:text-2xl font-bold gradient-text">{selectedDistricts.length}</p>
                    </div>
                    
                    {/* Total Districts */}
                    <div className="py-3 px-3 rounded-xl border border-border/40 bg-muted/30">
                      <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Total Districts</p>
                      <p className="text-xl sm:text-2xl font-bold gradient-text">{BANGLADESH_DISTRICTS.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <MultiMonthSelector
                year={year}
                selectedMonths={selectedMonths}
                onYearChange={setYear}
                onMonthToggle={(month) => {
                  if (selectedMonths.includes(month)) {
                    setSelectedMonths(prev => prev.filter(m => m !== month));
                  } else {
                    setSelectedMonths(prev => [...prev, month]);
                  }
                }}
                onSelectAll={() => setSelectedMonths(MONTHS.map(m => m.value))}
                onDeselectAll={() => setSelectedMonths([])}
                disabled={isFetching}
              />
            </TabsContent>

            {/* Hijri Month Mode */}
            <TabsContent value="hijriMonth" className="space-y-4 mt-4">
              {/* Summary Card */}
              <Card className="border-primary/30 overflow-hidden shadow-sm bg-primary/5 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {/* Selected Months */}
                    <div className="py-3 px-3 rounded-xl border border-border/40 bg-muted/30">
                      <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Selected Months</p>
                      <p className="text-xl sm:text-2xl font-bold gradient-text">{selectedHijriMonths.length}</p>
                    </div>
                    
                    {/* Total Days */}
                    {selectedHijriMonths.length > 0 && (
                      <div className="py-3 px-3 rounded-xl border border-border/40 bg-muted/30">
                        <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Total Days</p>
                        <p className="text-xl sm:text-2xl font-bold gradient-text">~{selectedHijriMonths.length * 30}</p>
                      </div>
                    )}
                    
                    {/* Est. Entries */}
                    <div className="py-3 px-3 rounded-xl border border-primary/30 bg-primary/10">
                      <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Est. Entries</p>
                      <p className="text-xl sm:text-2xl font-bold text-primary">
                        {(selectedHijriMonths.length * 30 * (selectedDistricts.length > 0 ? selectedDistricts.length : BANGLADESH_DISTRICTS.length)).toLocaleString()}
                      </p>
                    </div>
                    
                    {/* Selected Districts */}
                    <div className="py-3 px-3 rounded-xl border border-border/40 bg-muted/30">
                      <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Selected Districts</p>
                      <p className="text-xl sm:text-2xl font-bold gradient-text">{selectedDistricts.length}</p>
                    </div>
                    
                    {/* Total Districts */}
                    <div className="py-3 px-3 rounded-xl border border-border/40 bg-muted/30">
                      <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Total Districts</p>
                      <p className="text-xl sm:text-2xl font-bold gradient-text">{BANGLADESH_DISTRICTS.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <MonthSelector
                title="Select Hijri Months"
                description="Choose Hijri months to fetch prayer times for"
                year={hijriYear}
                selectedMonths={selectedHijriMonths}
                months={HIJRI_MONTHS}
                years={HIJRI_YEARS}
                onYearChange={setHijriYear}
                onMonthToggle={(month) => {
                  if (selectedHijriMonths.includes(month)) {
                    setSelectedHijriMonths(prev => prev.filter(m => m !== month));
                  } else {
                    setSelectedHijriMonths(prev => [...prev, month]);
                  }
                }}
                onSelectAll={() => setSelectedHijriMonths(HIJRI_MONTHS.map(m => m.value))}
                onDeselectAll={() => setSelectedHijriMonths([])}
                disabled={isFetching}
                showStatistics={false}
                yearLabel="Hijri Year"
                yearPlaceholder="Select Hijri year"
              />
            </TabsContent>
          </Tabs>

          {/* District Selection */}
          <DistrictSelector
            title="Select Districts"
            description="Choose districts to fetch prayer times for"
            selectedDistricts={selectedDistricts}
            districts={BANGLADESH_DISTRICTS_WITH_DIVISION}
            onDistrictToggle={(district) => {
              if (selectedDistricts.includes(district)) {
                setSelectedDistricts(prev => prev.filter(d => d !== district));
              } else {
                setSelectedDistricts(prev => [...prev, district]);
              }
            }}
            onSelectAll={() => setSelectedDistricts([...BANGLADESH_DISTRICTS])}
            onDeselectAll={() => setSelectedDistricts([])}
            disabled={isFetching}
            maxDisplayHeight="250px"
          />

          {/* Fetch Button */}
          <Button
            className="w-full btn-gradient rounded-full h-12 font-semibold"
            onClick={handleFetch}
            disabled={isFetching || 
              (fetchMode === 'dateRange' && (!startDate || !endDate)) ||
              (fetchMode === 'multiMonth' && selectedMonths.length === 0)
            }
          >
            {isFetching ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Fetching Prayer Times...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Cloud className="h-4 w-4" />
                Fetch Prayer Times
              </span>
            )}
          </Button>

          {/* Fetch Progress */}
          {isFetching && (
            <>
              {fetchProgressData.progress ? (
                <ProgressBar 
                  progress={fetchProgressData.progress} 
                  statusMessages={{
                    initializing: 'Initializing fetch...',
                    fetching: 'Fetching prayer times...',
                    processing: 'Processing entries...',
                    completed: 'Fetch complete!',
                  }}
                  showCurrentDistrict={true}
                />
              ) : (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Connecting to progress stream...
                    </span>
                    <span className="font-medium">0%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary animate-pulse" style={{ width: '0%' }} />
                  </div>
                  <div className="text-xs text-muted-foreground text-center">
                    Establishing connection to receive progress updates...
                  </div>
                </div>
              )}
            </>
          )}

          {/* Fetch Error */}
          {fetchError && (
            <Alert variant="destructive" className="border-red-500/30 bg-red-500/8">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">{fetchError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* ── Rate Limit Configuration ───────────────────── */}
      <RateLimitConfig
        config={rateLimitConfig}
        onChange={setRateLimitConfig}
        estimatedRequests={estimatedEntries}
      />

      {/* ── Preview Section ─────────────────────────── */}
      {fetchedData.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold gradient-text">Preview</h2>
              <p className="text-muted-foreground text-sm mt-1">
                {fetchedData.length.toLocaleString()} entries fetched
              </p>
            </div>
            <div className="flex gap-2">
              <ExportButton
                data={fetchedData}
                disabled={isUploading}
                filename={`prayer-times-${new Date().toISOString().split('T')[0]}`}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearData}
                disabled={isUploading}
                className="rounded-full"
              >
                Clear
              </Button>
            </div>
          </div>

          {/* District Filter Tabs */}
          <div className="mb-4">
            <Tabs value={selectedPreviewDistrict} onValueChange={(value) => setSelectedPreviewDistrict(value)}>
              <TabsList className="w-full">
                <TabsTrigger value="all" className="rounded-full">
                  All Districts
                </TabsTrigger>
                {selectedDistricts.slice(0, 5).map((district) => (
                  <TabsTrigger key={district} value={district} className="rounded-full">
                    {district}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Preview Table */}
          <ScheduleCard
            title={`Schedule Preview${selectedPreviewDistrict !== 'all' ? ` - ${selectedPreviewDistrict}` : ''}`}
            description={`Showing ${previewData.length} entries`}
            contentClassName="p-0"
          >
            <ScheduleTable
              entries={previewData.map((entry, index) => ({
                id: `preview-${index}`,
                date: entry.date,
                sehri: entry.sehri,
                iftar: entry.iftar,
                location: entry.location,
                createdAt: new Date(),
                updatedAt: new Date(),
              }))}
              showLocation={true}
              showStatus={false}
              showTodayBadge={false}
              rowClassVariant="simple"
            />
          </ScheduleCard>

          {/* Upload Actions */}
          <div className="flex justify-end pt-4">
            <Button
              className="btn-gradient rounded-full h-12 font-semibold px-8"
              onClick={() => setShowUploadConfirm(true)}
              disabled={isUploading || fetchedData.length === 0}
            >
              {isUploading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Uploading...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Auto-Upload to Database
                </span>
              )}
            </Button>
          </div>
        </>
      )}

      {/* ── Upload Confirmation Modal ─────────────────── */}
      <AppModal
        open={showUploadConfirm}
        onOpenChange={setShowUploadConfirm}
        title="Confirm Auto-Upload"
        description={
          <>
            This will upload <strong>{fetchedData.length.toLocaleString()}</strong> entries to the database. 
            Existing entries with the same date and location will be updated.
          </>
        }
        titleClassName="gradient-text"
        maxWidth="md"
        primaryAction={{
          label: (loading) => loading ? "Uploading…" : "Confirm Upload",
          onClick: handleUpload,
          loading: isUploading,
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setShowUploadConfirm(false),
        }}
      />

      {/* ── Upload Progress ───────────────────────────── */}
      {(isUploading || uploadProgressData.progress) && (
        <Card className="border-primary/30 overflow-hidden shadow-sm bg-primary/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Upload className="h-4 w-4 text-primary" />
              Upload Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {uploadProgressData.progress ? (
              <ProgressBar
                progress={uploadProgressData.progress}
                statusMessages={{
                  initializing: 'Initializing upload...',
                  fetching: 'Uploading entries...',
                  processing: 'Processing entries...',
                  completed: 'Upload complete!',
                }}
                showCurrentDistrict={false}
              />
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Connecting to progress stream...
                  </span>
                  <span className="font-medium">0%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary animate-pulse" style={{ width: '0%' }} />
                </div>
                <div className="text-xs text-muted-foreground text-center">
                  Establishing connection to receive progress updates...
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Upload Result Modal ────────────────────── */}
      {uploadResult && (
        <AppModal
          open={!!uploadResult}
          onOpenChange={() => setUploadResult(null)}
          title={uploadResult.success ? "✓ Upload Successful" : "✗ Upload Failed"}
          description={uploadResult.message}
          titleClassName={uploadResult.success ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}
          maxWidth="md"
          primaryAction={{
            label: uploadResult.success ? "Go to Dashboard" : "Close",
            onClick: () => {
              if (uploadResult.success) {
                router.push('/admin/dashboard');
              } else {
                setUploadResult(null);
              }
            },
          }}
          showFooter={true}
        >
          {uploadResult.success && uploadResult.rowCount !== undefined && (
            <div className="space-y-4">
              <div className="py-3 px-4 rounded-xl border border-primary/30 bg-primary/10">
                <p className="text-xs text-muted-foreground mb-1">Entries Uploaded</p>
                <p className="text-lg font-bold gradient-text">{uploadResult.rowCount.toLocaleString()}</p>
              </div>
            </div>
          )}
        </AppModal>
      )}
      </div>
    </DashboardGuard>
  );
}
