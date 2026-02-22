"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { uploadSchedule, validateScheduleFile, type ActionResult } from "@/actions/upload.actions.new";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AppModal } from "@/components/ui/app-modal";
import { ProgressBar, type ProgressData } from "@/components/ui/progress-bar";
import { Upload, FileJson, FileSpreadsheet, Download, AlertCircle, CheckCircle2, CloudUpload, RefreshCw, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScheduleTable } from "@/components/shared/schedule-table";
import { ScheduleCard } from "@/components/shared/schedule-card";
import { PageHero } from "@/components/shared/page-hero";
import { DashboardGuard } from "@/lib/guards";
import { CacheClearButton } from "@/components/admin/cache-clear-button";

// Admin pages should never be cached - they need real-time data
export const dynamic = 'force-dynamic';

interface ParsedEntry {
  date: string;
  sehri: string;
  iftar: string;
  location?: string | null;
}

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedEntry[]>([]);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors: Array<{ row: number; error: string }>;
    preview: ParsedEntry[];
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [uploadResult, setUploadResult] = useState<ActionResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState<ProgressData | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const selectedFile = acceptedFiles[0];
    setFile(selectedFile);
    setUploadResult(null);
    setValidationResult(null);

    if (selectedFile.name.endsWith(".json")) {
      const text = await selectedFile.text();
      try {
        const json = JSON.parse(text);
        setParsedData(json);
        const validation = await validateScheduleFile(json);
        if (validation.success) {
          setValidationResult(validation.data);
        } else {
          toast.error(validation.error?.message || "Validation failed");
          setValidationResult(null);
        }
      } catch {
        toast.error("Invalid JSON file");
        setParsedData([]);
      }
    } else if (selectedFile.name.endsWith(".csv")) {
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const data = results.data as ParsedEntry[];
          setParsedData(data);
          const validation = await validateScheduleFile(data);
          if (validation.success) {
            setValidationResult(validation.data);
          } else {
            toast.error(validation.error?.message || "Validation failed");
            setValidationResult(null);
          }
        },
        error: () => {
          toast("Failed to parse CSV file");
          setParsedData([]);
        },
      });
    } else {
      toast.error("Only JSON and CSV files are supported");
      setFile(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/json": [".json"], "text/csv": [".csv"] },
    maxFiles: 1,
    maxSize: 1024 * 1024,
  });

  const handleUpload = async () => {
    if (parsedData.length === 0) return;
    setIsUploading(true);
    setUploadProgress({
      current: 0,
      total: parsedData.length,
      percentage: 0,
      batch: 0,
      totalBatches: Math.ceil(parsedData.length / 50),
      status: 'validating',
    });
    setShowConfirmDialog(false);

    // Simulate progress updates during upload
    // Note: Server actions don't support real-time callbacks, so we simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (!prev) return null;
        const newCurrent = Math.min(prev.current + 5, prev.total);
        const newPercentage = Math.round((newCurrent / prev.total) * 100);
        const newBatch = Math.floor(newCurrent / 50) + 1;
        
        // Update status based on progress
        let newStatus: ProgressData['status'] = 'uploading';
        if (newPercentage >= 100) {
          newStatus = 'completed';
          clearInterval(progressInterval);
        } else if (newPercentage > 50 && newPercentage < 80) {
          newStatus = 'retrying';
        }

        return {
          current: newCurrent,
          total: prev.total,
          percentage: newPercentage,
          batch: newBatch,
          totalBatches: prev.totalBatches,
          status: newStatus,
        };
      });
    }, 100);

    const result = await uploadSchedule(parsedData, file?.name || "unknown");
    
    clearInterval(progressInterval);
    
    setUploadResult(result);
    setUploadProgress({
      current: parsedData.length,
      total: parsedData.length,
      percentage: 100,
      batch: Math.ceil(parsedData.length / 50),
      totalBatches: Math.ceil(parsedData.length / 50),
      status: result.success ? 'completed' : 'failed',
    });
    setIsUploading(false);
    
    if (result.success) {
      toast.success(result.data?.message || "Upload successful");
    } else {
      toast.error(result.error?.message || "Upload failed");
    }
  };

  const downloadSampleJSON = () => {
    const sample = [{ date: "2026-03-01", sehri: "04:45", iftar: "18:12", location: "Dhaka" }];
    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "sample-schedule.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadSampleCSV = () => {
    const sample = [{ date: "2026-03-01", sehri: "04:45", iftar: "18:12", location: "Dhaka" }];
    const csv = Papa.unparse(sample);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "sample-schedule.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardGuard>
      <div className="w-full max-w-5xl mx-auto py-10 px-4 space-y-8">
      {/* ── Hero Banner ──────────────────────────────── */}
      <PageHero
        subtitle="✦ Admin Panel"
        title={
          <>
            Upload <span className="gradient-text">Schedule</span>
          </>
        }
        description="Upload Sehri & Iftar schedules via JSON or CSV"
        actions={<CacheClearButton />}
      />

      {/* ── Upload + Validation ─────────────────────── */}
      <div className="grid gap-6 md:grid-cols-2">

        {/* Upload Card */}
        <Card className="border-primary/30 overflow-hidden shadow-sm bg-primary/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <CloudUpload className="h-4 w-4 text-primary" />
              Upload File
            </CardTitle>
            <CardDescription>Drag and drop or browse to select a file</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Drop Zone */}
            <div
              {...getRootProps()}
              className={`relative rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 ${isDragActive
                  ? "border-primary bg-primary/8 scale-[1.02]"
                  : "border-border/60 hover:border-primary/60 hover:bg-primary/4"
                }`}
            >
              <input {...getInputProps()} />
              <div
                className="mx-auto mb-4 inline-flex p-4 rounded-2xl"
                style={{
                  background: isDragActive
                    ? "var(--grad-primary)"
                    : "linear-gradient(135deg,rgba(59,130,246,.10),rgba(168,85,247,.10))",
                }}
              >
                <Upload className={`h-8 w-8 ${isDragActive ? "text-white" : "text-primary"}`} />
              </div>
              <p className="text-sm font-medium text-foreground">
                {isDragActive ? "Drop the file here" : "Drag & drop a file here"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                or <span className="text-primary font-semibold">click to browse</span>
              </p>
              <p className="mt-2 text-xs text-muted-foreground/70">JSON or CSV • max 1 MB</p>
            </div>

            {/* Selected File */}
            {file && (
              <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-primary/20 bg-primary/5">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-primary/15">
                    {file.name.endsWith(".json") ? (
                      <FileJson className="h-4 w-4 text-primary" />
                    ) : (
                      <FileSpreadsheet className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <span className="text-sm font-medium truncate max-w-[160px]">{file.name}</span>
                </div>
                <Badge
                  className="text-xs"
                  style={{ background: "var(--grad-primary)", color: "white", border: "none" }}
                >
                  {(file.size / 1024).toFixed(1)} KB
                </Badge>
              </div>
            )}

            {/* Sample Downloads */}
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadSampleJSON}
                className="rounded-full text-xs border-border/60 hover:border-primary/50 hover:text-primary"
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Sample JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadSampleCSV}
                className="rounded-full text-xs border-border/60 hover:border-primary/50 hover:text-primary"
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Sample CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Validation Card */}
        <Card className="border-primary/30 overflow-hidden shadow-sm bg-primary/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Validation Status
            </CardTitle>
            <CardDescription>File validation results</CardDescription>
          </CardHeader>
          <CardContent>
            {!validationResult && !file && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div
                  className="p-4 rounded-2xl mb-3"
                  style={{ background: "linear-gradient(135deg,rgba(59,130,246,.08),rgba(168,85,247,.08))" }}
                >
                  <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground">Upload a file to see validation results</p>
              </div>
            )}

            {validationResult && (
              <div className="space-y-4">
                {validationResult.valid ? (
                  <Alert className="border-emerald-500/30 bg-emerald-500/8 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription className="font-medium">
                      ✓ All {parsedData.length} entries are valid and ready to upload
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive" className="border-red-500/30 bg-red-500/8">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Found {validationResult.errors.length} validation errors
                    </AlertDescription>
                  </Alert>
                )}

                {validationResult.errors.length > 0 && (
                  <div className="max-h-40 overflow-y-auto space-y-1.5 rounded-xl bg-destructive/5 p-3">
                    {validationResult.errors.slice(0, 5).map((error, i) => (
                      <div key={i} className="text-xs text-destructive flex gap-1.5">
                        <span className="font-bold shrink-0">Row {error.row}:</span>
                        <span>{error.error}</span>
                      </div>
                    ))}
                    {validationResult.errors.length > 5 && (
                      <p className="text-xs text-muted-foreground">
                        +{validationResult.errors.length - 5} more errors
                      </p>
                    )}
                  </div>
                )}

                <Button
                  className={`w-full rounded-full h-11 font-semibold ${validationResult.valid ? "btn-gradient" : ""}`}
                  disabled={!validationResult.valid || isUploading}
                  onClick={() => setShowConfirmDialog(true)}
                >
                  {isUploading ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Uploading…
                    </span>
                  ) : (
                    `Upload ${parsedData.length} Entries`
                  )}
                </Button>

                {/* Progress Indicator */}
                <ProgressBar progress={uploadProgress} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Preview Table ───────────────────────────── */}
      {validationResult && validationResult.preview.length > 0 && (
        <ScheduleCard
          title="Preview"
          description={`First ${validationResult.preview.length} entries from your file`}
          contentClassName="p-0"
        >
          <ScheduleTable
            entries={validationResult.preview.map((entry, index) => ({
              id: `preview-${index}`,
              date: entry.date,
              sehri: entry.sehri,
              iftar: entry.iftar,
              location: entry.location || null,
              createdAt: new Date(),
              updatedAt: new Date(),
            }))}
            showLocation={true}
            showStatus={false}
            showTodayBadge={false}
            rowClassVariant="simple"
          />
        </ScheduleCard>
      )}

      {/* ── Confirm Dialog ──────────────────────────── */}
      <AppModal
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="Confirm Upload"
        description={
          <>
            This will upload <strong>{parsedData.length}</strong> entries to the database. Existing entries with the same date and location will be updated.
          </>
        }
        primaryAction={{
          label: (loading) => loading ? "Uploading…" : "Confirm Upload",
          onClick: handleUpload,
          loading: isUploading,
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setShowConfirmDialog(false),
        }}
      />

      {/* ── Result Dialog ───────────────────────────── */}
      {uploadResult && (
        <AppModal
          open={!!uploadResult}
          onOpenChange={() => setUploadResult(null)}
          title={uploadResult.success ? "✓ Upload Successful" : "✗ Upload Failed"}
          description={uploadResult.success ? uploadResult.data?.message : uploadResult.error?.message}
          titleClassName={uploadResult.success ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}
          primaryAction={{
            label: uploadResult.success ? "Go to Dashboard" : "Close",
            onClick: () => {
              if (uploadResult.success) {
                // Clear all upload data and redirect to dashboard
                setFile(null);
                setParsedData([]);
                setValidationResult(null);
                setUploadResult(null);
                setUploadProgress(null);
                router.push('/admin/dashboard');
              } else {
                setUploadResult(null);
                setUploadProgress(null);
              }
            },
          }}
          showFooter={true}
        >
          {uploadResult.success && uploadResult.data && (
            <div className="space-y-4">
              {/* Upload Statistics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="py-3 px-4 rounded-xl border border-border/60 bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Entries Uploaded</p>
                  <p className="text-lg font-bold gradient-text">{uploadResult.data.rowCount}</p>
                </div>
                {uploadResult.data.retried !== undefined && uploadResult.data.retried > 0 && (
                  <div className="py-3 px-4 rounded-xl border border-amber-500/30 bg-amber-500/8">
                    <div className="flex items-center gap-1.5 mb-1">
                      <RefreshCw className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                      <p className="text-xs text-amber-700 dark:text-amber-400">Retried Entries</p>
                    </div>
                    <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{uploadResult.data.retried}</p>
                  </div>
                )}
              </div>

              {/* Rollback Notice */}
              {uploadResult.data.rolledBack && (
                <Alert className="border-amber-500/30 bg-amber-500/8">
                  <RotateCcw className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <AlertDescription className="text-amber-700 dark:text-amber-400">
                    Transaction was rolled back due to errors. No data was modified.
                  </AlertDescription>
                </Alert>
              )}

              {/* Errors */}
              {uploadResult.data.errors && uploadResult.data.errors.length > 0 && (
                <div className="max-h-48 overflow-y-auto space-y-1.5 rounded-xl bg-destructive/5 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <p className="text-xs font-bold text-destructive">
                      {uploadResult.data.errors.length} Error{uploadResult.data.errors.length > 1 ? 's' : ''}:
                    </p>
                  </div>
                  {uploadResult.data.errors.map((error: { row: number; error: string }, i: number) => (
                    <div key={i} className="text-xs text-destructive flex gap-2">
                      <span className="font-bold shrink-0">Row {error.row}:</span>
                      <span className="break-words">{error.error}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </AppModal>
      )}
      </div>
    </DashboardGuard>
  );
}
