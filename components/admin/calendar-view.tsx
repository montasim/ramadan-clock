"use client";

import { useState } from "react";
import { TimeEntry } from "@prisma/client";
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
import { AlertTriangle, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScheduleTable } from "@/components/shared/schedule-table";

interface CalendarViewProps {
  entries: Array<TimeEntry & { sehri24?: string; iftar24?: string }>;
}

// Get today's date in local timezone (YYYY-MM-DD format)
const getTodayLocal = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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
  const handleEdit = (entry: TimeEntry & { sehri24?: string; iftar24?: string }) => {
    setEditingEntry(entry);
    setFormData({
      date: entry.date,
      sehri: entry.sehri24 || entry.sehri,
      iftar: entry.iftar24 || entry.iftar,
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
      <ScheduleTable
        entries={entries}
        showLocation={true}
        showStatus={true}
        showTodayBadge={true}
        rowClassVariant="full"
        editable={true}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelectOne={handleSelectOne}
        onEdit={handleEdit}
        onDelete={setDeletingEntry}
        isAllSelected={isAllSelected}
      />

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
