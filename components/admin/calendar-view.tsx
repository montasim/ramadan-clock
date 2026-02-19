"use client";

import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteTimeEntry, updateTimeEntry } from "@/actions/time-entries";
import { toast } from "sonner";
import { Pencil, Trash2, AlertTriangle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CalendarViewProps {
  entries: TimeEntry[];
}

const today = new Date().toISOString().split("T")[0];

const bangladeshDistricts = [
  // Barisal Division
  "Barguna", "Barisal", "Bhola", "Jhalokati", "Patuakhali", "Pirojpur",
  // Chittagong Division
  "Bandarban", "Brahmanbaria", "Chandpur", "Chittagong", "Comilla",
  "Cox's Bazar", "Feni", "Khagrachari", "Lakshmipur", "Noakhali", "Rangamati",
  // Dhaka Division
  "Dhaka", "Faridpur", "Gazipur", "Gopalganj", "Kishoreganj", "Madaripur",
  "Manikganj", "Munshiganj", "Narayanganj", "Narsingdi", "Rajbari",
  "Shariatpur", "Tangail",
  // Khulna Division
  "Bagerhat", "Chuadanga", "Jessore", "Jhenaidah", "Khulna", "Kushtia",
  "Magura", "Meherpur", "Narail", "Satkhira",
  // Mymensingh Division
  "Jamalpur", "Mymensingh", "Netrokona", "Sherpur",
  // Rajshahi Division
  "Bogra", "Chapainawabganj", "Joypurhat", "Naogaon", "Natore", "Pabna",
  "Rajshahi", "Sirajganj",
  // Rangpur Division
  "Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari",
  "Panchagarh", "Rangpur", "Thakurgaon",
  // Sylhet Division
  "Habiganj", "Moulvibazar", "Sunamganj", "Sylhet",
];

export function CalendarView({ entries }: CalendarViewProps) {
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [formData, setFormData] = useState({ date: "", sehri: "", iftar: "", location: "" });
  const [isUpdating, setIsUpdating] = useState(false);

  // Single delete modal
  const [deletingEntry, setDeletingEntry] = useState<TimeEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Bulk delete modal
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  /* ── Edit ─────────────────────────────────── */
  const handleEdit = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setFormData({
      date: entry.date,
      sehri: entry.sehri,
      iftar: entry.iftar,
      location: entry.location || "",
    });
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    const result = await updateTimeEntry(editingEntry!.id, {
      date: formData.date,
      sehri: formData.sehri,
      iftar: formData.iftar,
      location: formData.location || null,
    });
    setIsUpdating(false);
    if (result.success) {
      toast.success("Entry updated successfully");
      setEditingEntry(null);
    } else {
      toast.error(result.error || "Failed to update entry");
    }
  };

  /* ── Single Delete ────────────────────────── */
  const handleDeleteConfirm = async () => {
    if (!deletingEntry) return;
    setIsDeleting(true);
    const result = await deleteTimeEntry(deletingEntry.id);
    setIsDeleting(false);
    if (result.success) {
      toast.success("Entry deleted successfully");
      setSelectedIds((prev) => { const n = new Set(prev); n.delete(deletingEntry.id); return n; });
      setDeletingEntry(null);
    } else {
      toast.error(result.error || "Failed to delete entry");
    }
  };

  /* ── Bulk Delete ──────────────────────────── */
  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(entries.map((e) => e.id)) : new Set());
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkDeleting(true);
    let successCount = 0, failCount = 0;
    for (const id of selectedIds) {
      const result = await deleteTimeEntry(id);
      result.success ? successCount++ : failCount++;
    }
    setIsBulkDeleting(false);
    setSelectedIds(new Set());
    setShowBulkDeleteModal(false);
    if (successCount > 0) toast.success(`Deleted ${successCount} entries`);
    if (failCount > 0) toast.error(`Failed to delete ${failCount} entries`);
  };

  const isAllSelected = entries.length > 0 && selectedIds.size === entries.length;

  return (
    <>
      {/* ── Bulk Selection Bar ─────────────────── */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between mb-4 px-4 py-3 rounded-xl border border-destructive/25 bg-destructive/5">
          <span className="text-sm font-medium text-destructive">
            {selectedIds.size} entr{selectedIds.size > 1 ? "ies" : "y"} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            className="rounded-full gap-1.5"
            onClick={() => setShowBulkDeleteModal(true)}
            disabled={isBulkDeleting}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Selected ({selectedIds.size})
          </Button>
        </div>
      )}

      {/* ── Table ─────────────────────────────── */}
      <div className="relative overflow-x-auto rounded-xl border border-border/40 bg-card/30">
        <Table className="min-w-[600px] sm:min-w-full">
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="w-[40px] px-3">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                  className="hidden sm:inline-flex"
                />
              </TableHead>
              <TableHead className="w-[140px] px-2 sm:px-4">Date</TableHead>
              <TableHead className="px-2 sm:px-4">Sehri</TableHead>
              <TableHead className="px-2 sm:px-4">Iftar</TableHead>
              <TableHead className="px-2 sm:px-4">Location</TableHead>
              <TableHead className="text-center px-2 sm:px-4 hidden md:table-cell">Status</TableHead>
              <TableHead className="text-right px-3 sm:px-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => {
              const isToday = entry.date === today;
              const entryDate = new Date(entry.date);
              const todayDate = new Date(today);
              const isSelected = selectedIds.has(entry.id);
              
              // Parse sehri and iftar times
              const parseTime = (timeStr: string) => {
                const [hours, minutes] = timeStr.split(':').map(Number);
                return { hours, minutes };
              };
              
              const sehriTime = parseTime(entry.sehri);
              const iftarTime = parseTime(entry.iftar);
              
              // Get current time in Asia/Dhaka timezone
              const now = new Date();
              const currentHours = now.getHours();
              const currentMinutes = now.getMinutes();
              
              // Check if current time is past a given time
              const isTimePast = (hours: number, minutes: number) => {
                return currentHours > hours || (currentHours === hours && currentMinutes >= minutes);
              };
              
              // Determine status based on time
              let status: "passed" | "today" | "tomorrow" | "upcoming";
              let statusText: string;
              let rowClass: string;
              
              if (entryDate < todayDate) {
                // Past dates are always passed
                status = "passed";
                statusText = "Passed";
                rowClass = "bg-red-500/10 border-red-500/30";
              } else if (isToday) {
                // Today: check if iftar time has passed
                if (isTimePast(iftarTime.hours, iftarTime.minutes)) {
                  status = "passed";
                  statusText = "Passed";
                  rowClass = "bg-red-500/10 border-red-500/30";
                } else {
                  status = "today";
                  statusText = "Today";
                  rowClass = "bg-blue-500/6 border-blue-500/20";
                }
              } else {
                // Future dates: check if it's tomorrow
                const tomorrowDate = new Date(todayDate);
                tomorrowDate.setDate(tomorrowDate.getDate() + 1);
                const isTomorrow = entryDate.getTime() === tomorrowDate.getTime();
                
                if (isTomorrow) {
                  // Tomorrow: check if sehri time has passed
                  if (isTimePast(sehriTime.hours, sehriTime.minutes)) {
                    status = "today";
                    statusText = "Today";
                    rowClass = "bg-blue-500/6 border-blue-500/20";
                  } else {
                    status = "tomorrow";
                    statusText = "Tomorrow";
                    rowClass = "hover:bg-primary/4 border-border/40";
                  }
                } else {
                  status = "upcoming";
                  statusText = "Upcoming";
                  rowClass = "hover:bg-primary/4 border-border/40";
                }
              }
              
              return (
                <TableRow
                  key={entry.id}
                  className={rowClass}
                >
                  <TableCell className="px-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(c) => handleSelectOne(entry.id, c as boolean)}
                      aria-label={`Select entry for ${entry.date}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium px-2 sm:px-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-xs sm:text-sm">
                        {new Date(entry.date).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </span>
                      {status === "today" && (
                        <span
                          className="w-fit text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded-full text-white font-bold mt-1"
                          style={{ background: "var(--grad-primary)" }}
                        >
                          TODAY
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-amber-600 dark:text-amber-400 px-2 sm:px-4">{entry.sehri}</TableCell>
                  <TableCell className="font-semibold text-violet-600 dark:text-violet-400 px-2 sm:px-4">{entry.iftar}</TableCell>
                  <TableCell className="text-muted-foreground text-xs sm:text-sm px-2 sm:px-4">{entry.location || "—"}</TableCell>
                  <TableCell className="text-center px-2 sm:px-4 hidden md:table-cell">
                    {status === "passed" ? (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30">Passed</Badge>
                    ) : status === "today" ? (
                      <Badge className="text-[10px] px-1.5 py-0 bg-primary/20 text-primary hover:bg-primary/30 border-primary/30">Today</Badge>
                    ) : status === "tomorrow" ? (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-500/40 text-amber-600 dark:text-amber-400">Tomorrow</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/40 text-primary">Upcoming</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right px-3 sm:px-4">
                    <div className="flex justify-end gap-1 sm:gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={() => handleEdit(entry)}
                        title="Edit entry"
                      >
                        <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                        onClick={() => setDeletingEntry(entry)}
                        title="Delete entry"
                      >
                        <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* ── Edit Dialog ────────────────────────── */}
      <Dialog open={!!editingEntry} onOpenChange={() => setEditingEntry(null)}>
        <DialogContent className="border-border/60 bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold gradient-text">Edit Entry</DialogTitle>
            <DialogDescription>
              Update the Sehri &amp; Iftar times for this date
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label htmlFor="edit-date" className="text-sm font-semibold">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="h-10 rounded-xl border-border/60"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-sehri" className="text-sm font-semibold">Sehri Time</Label>
              <Input
                id="edit-sehri"
                type="time"
                value={formData.sehri}
                onChange={(e) => setFormData({ ...formData, sehri: e.target.value })}
                className="h-10 rounded-xl border-border/60"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-iftar" className="text-sm font-semibold">Iftar Time</Label>
              <Input
                id="edit-iftar"
                type="time"
                value={formData.iftar}
                onChange={(e) => setFormData({ ...formData, iftar: e.target.value })}
                className="h-10 rounded-xl border-border/60"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-location" className="text-sm font-semibold">Location</Label>
              <Select
                value={formData.location}
                onValueChange={(v) => setFormData({ ...formData, location: v })}
              >
                <SelectTrigger id="edit-location" className="h-10 w-full rounded-xl border-border/60">
                  <SelectValue placeholder="Select a district" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto" position="popper">
                  {bangladeshDistricts.map((district) => (
                    <SelectItem key={district} value={district}>{district}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setEditingEntry(null)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button className="btn-gradient rounded-full" onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Single Delete Confirm Dialog ───────── */}
      <Dialog open={!!deletingEntry} onOpenChange={() => setDeletingEntry(null)}>
        <DialogContent className="border-border/60 bg-card sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 rounded-xl bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle className="text-lg font-bold text-destructive">Delete Entry</DialogTitle>
            </div>
            <DialogDescription className="pl-[52px]">
              Are you sure you want to delete the schedule for{" "}
              <strong>
                {deletingEntry
                  ? new Date(deletingEntry.date).toLocaleDateString("en-US", {
                    weekday: "short", month: "long", day: "numeric", year: "numeric",
                  })
                  : ""}
              </strong>
              {deletingEntry?.location ? ` (${deletingEntry.location})` : ""}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setDeletingEntry(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-full gap-2"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Deleting…" : "Delete Entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Bulk Delete Confirm Dialog ─────────── */}
      <Dialog open={showBulkDeleteModal} onOpenChange={setShowBulkDeleteModal}>
        <DialogContent className="border-border/60 bg-card sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 rounded-xl bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle className="text-lg font-bold text-destructive">Delete {selectedIds.size} Entries</DialogTitle>
            </div>
            <DialogDescription className="pl-[52px]">
              You are about to permanently delete{" "}
              <strong>{selectedIds.size} schedule entries</strong>. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setShowBulkDeleteModal(false)}
              disabled={isBulkDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-full gap-2"
              onClick={handleBulkDeleteConfirm}
              disabled={isBulkDeleting}
            >
              <Trash2 className="h-4 w-4" />
              {isBulkDeleting ? "Deleting…" : `Delete All ${selectedIds.size}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
