"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { uploadSchedule, validateScheduleFile, type UploadResult } from "@/actions/upload";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload, FileJson, FileSpreadsheet, Download, AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

    // Parse file based on type
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
    accept: {
      "application/json": [".json"],
      "text/csv": [".csv"],
    },
    maxFiles: 1,
    maxSize: 1024 * 1024, // 1MB
  });

  const handleUpload = async () => {
    if (parsedData.length === 0) return;

    setIsUploading(true);
    const result = await uploadSchedule(parsedData, file?.name || "unknown");
    setUploadResult(result);
    setIsUploading(false);
    setShowConfirmDialog(false);

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const downloadSampleJSON = () => {
    const sample = [
      {
        date: "2026-03-01",
        sehri: "04:45",
        iftar: "18:12",
        location: "Dhaka",
      },
    ];
    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample-schedule.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadSampleCSV = () => {
    const sample = [
      { date: "2026-03-01", sehri: "04:45", iftar: "18:12", location: "Dhaka" },
    ];
    const csv = Papa.unparse(sample);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample-schedule.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-4 space-y-8">
        <div>
          <h1 className="text-3xl font-semibold">Upload Schedule</h1>
          <p className="text-muted-foreground">
            Upload Sehri & Iftar schedules via JSON or CSV
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
            <CardDescription>
              Drag and drop or browse to select a file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">
                {isDragActive ? "Drop the file here" : "Drag & drop a file here, or click to select"}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                JSON or CSV (max 1MB)
              </p>
            </div>

            {file && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  {file.name.endsWith(".json") ? (
                    <FileJson className="h-5 w-5" />
                  ) : (
                    <FileSpreadsheet className="h-5 w-5" />
                  )}
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
                <Badge>{(file.size / 1024).toFixed(1)} KB</Badge>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={downloadSampleJSON}>
                <Download className="mr-2 h-4 w-4" />
                Sample JSON
              </Button>
              <Button variant="outline" size="sm" onClick={downloadSampleCSV}>
                <Download className="mr-2 h-4 w-4" />
                Sample CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Validation Status</CardTitle>
            <CardDescription>
              File validation results
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!validationResult && !file && (
              <p className="text-sm text-muted-foreground text-center py-8">
                Upload a file to see validation results
              </p>
            )}

            {validationResult && (
              <div className="space-y-4">
                {validationResult.valid ? (
                  <Alert className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      All {parsedData.length} entries are valid and ready to upload
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Found {validationResult.errors.length} errors
                    </AlertDescription>
                  </Alert>
                )}

                {validationResult.errors.length > 0 && (
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {validationResult.errors.slice(0, 5).map((error, index) => (
                      <div key={index} className="text-sm text-destructive">
                        Row {error.row}: {error.error}
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
                  className="w-full"
                  disabled={!validationResult.valid || isUploading}
                  onClick={() => setShowConfirmDialog(true)}
                >
                  {isUploading ? "Uploading..." : "Upload Schedule"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        </div>

        {validationResult && validationResult.preview.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                First 10 entries from your file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Sehri</TableHead>
                    <TableHead>Iftar</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validationResult.preview.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell>{entry.sehri}</TableCell>
                      <TableCell>{entry.iftar}</TableCell>
                      <TableCell>{entry.location || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Upload</DialogTitle>
            <DialogDescription>
              This will upload {parsedData.length} entries to the database. Existing entries with the same date and location will be updated.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading ? "Uploading..." : "Confirm Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {uploadResult && (
        <Dialog open={!!uploadResult} onOpenChange={() => setUploadResult(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {uploadResult.success ? "Upload Successful" : "Upload Failed"}
              </DialogTitle>
              <DialogDescription>
                {uploadResult.message}
              </DialogDescription>
            </DialogHeader>
            {uploadResult.rowCount && (
              <div className="py-4">
                <p className="text-sm">
                  <strong>Entries uploaded:</strong> {uploadResult.rowCount}
                </p>
              </div>
            )}
            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <div className="max-h-48 overflow-y-auto space-y-1">
                <p className="text-sm font-medium">Errors:</p>
                {uploadResult.errors.map((error, index) => (
                  <p key={index} className="text-sm text-destructive">
                    Row {error.row}: {error.error}
                  </p>
                ))}
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setUploadResult(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
