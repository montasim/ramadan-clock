"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { uploadSchedule, validateScheduleFile, type UploadResult } from "@/actions/upload";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AppModal } from "@/components/ui/app-modal";
import { Upload, FileJson, FileSpreadsheet, Download, AlertCircle, CheckCircle2, CloudUpload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScheduleTable } from "@/components/shared/schedule-table";
import { ScheduleCard } from "@/components/shared/schedule-card";
import { DashboardGuard } from "@/lib/guards";

interface ParsedEntry {
  date: string;
  sehri: string;
  iftar: string;
  location?: string | null;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedEntry[]>([]);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors: Array<{ row: number; error: string }>;
    preview: ParsedEntry[];
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

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
        setValidationResult(validation);
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
          setValidationResult(validation);
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
    const result = await uploadSchedule(parsedData, file?.name || "unknown");
    setUploadResult(result);
    setIsUploading(false);
    setShowConfirmDialog(false);
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
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
      <div className="hero-section px-6 py-8 overflow-hidden">
        <div
          className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: "var(--grad-primary)" }}
        />
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] gradient-text mb-2">
            ✦ Admin Panel
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
            Upload <span className="gradient-text">Schedule</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            Upload Sehri &amp; Iftar schedules via JSON or CSV
          </p>
        </div>
      </div>

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
                  {isUploading ? "Uploading…" : `Upload ${parsedData.length} Entries`}
                </Button>
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
          description={uploadResult.message}
          titleClassName={uploadResult.success ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}
          primaryAction={{
            label: "Close",
            onClick: () => setUploadResult(null),
          }}
          showFooter={true}
        >
          {uploadResult.rowCount && (
            <div className="py-2 px-4 rounded-xl border border-border/60 bg-muted/30">
              <p className="text-sm font-medium">
                Entries uploaded: <span className="gradient-text font-bold">{uploadResult.rowCount}</span>
              </p>
            </div>
          )}
          {uploadResult.errors && uploadResult.errors.length > 0 && (
            <div className="max-h-48 overflow-y-auto space-y-1 rounded-xl bg-destructive/5 p-3">
              <p className="text-xs font-bold text-destructive mb-2">Errors:</p>
              {uploadResult.errors.map((error, i) => (
                <p key={i} className="text-xs text-destructive">
                  Row {error.row}: {error.error}
                </p>
              ))}
            </div>
          )}
        </AppModal>
      )}
      </div>
    </DashboardGuard>
  );
}
