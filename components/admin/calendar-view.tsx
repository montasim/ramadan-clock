"use client";

import { useState } from "react";
import { TimeEntry } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { AppModal } from "@/components/ui/app-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteTimeEntry, updateTimeEntry, bulkDeleteTimeEntries } from "@/actions/time-entries";
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
import moment from 'moment';

interface CalendarViewProps {
  entries: Array<TimeEntry & { sehri24?: string; iftar24?: string }>;
  locations: string[];
}

// Get today's date in local timezone (YYYY-MM-DD format) using moment
const getTodayLocal = () => {
  return moment().format('YYYY-MM-DD');
};

export function CalendarView({ entries, locations }: CalendarViewProps) {
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
    const result = await bulkDeleteTimeEntries(Array.from(selectedIds));
    setIsBulkDeleting(false);
    setSelectedIds(new Set());
    setShowBulkDeleteModal(false);
    if (result.success && result.deletedCount) {
      toast.success(`Deleted ${result.deletedCount} entries`);
    } else {
      toast.error(result.error || "Failed to delete entries");
    }
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
      <AppModal
        open={!!editingEntry}
        onOpenChange={() => setEditingEntry(null)}
        title="Edit Entry"
        description="Update Sehri & Iftar times for this date"
        titleClassName="gradient-text"
        maxWidth="md"
        primaryAction={{
          label: (loading) => loading ? "Saving…" : "Save Changes",
          onClick: handleUpdate,
          loading: isUpdating,
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setEditingEntry(null),
        }}
      >
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
              <SelectContent className="max-h-20 overflow-y-auto" position="popper">
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </AppModal>

      {/* ── Single Delete Confirm Dialog ───────── */}
      <AppModal
        open={!!deletingEntry}
        onOpenChange={() => setDeletingEntry(null)}
        title="Delete Entry"
        description={
          <>
            Are you sure you want to delete schedule for{" "}
            <strong>
              {deletingEntry
                ? moment(deletingEntry.date).format("ddd, MMMM D, YYYY")
                : ""}
            </strong>
            {deletingEntry?.location ? ` (${deletingEntry.location})` : ""}? This action cannot be undone.
          </>
        }
        icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
        iconClassName="bg-destructive/10"
        titleClassName="text-destructive"
        maxWidth="md"
        primaryAction={{
          label: (loading) => loading ? "Deleting…" : "Delete Entry",
          onClick: handleDeleteConfirm,
          variant: "destructive",
          loading: isDeleting,
          icon: <Trash2 className="h-4 w-4" />,
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setDeletingEntry(null),
        }}
      />

      {/* ── Bulk Delete Confirm Dialog ─────────── */}
      <AppModal
        open={showBulkDeleteModal}
        onOpenChange={setShowBulkDeleteModal}
        title={`Delete ${selectedIds.size} Entries`}
        description={
          <>
            You are about to permanently delete{" "}
            <strong>{selectedIds.size} schedule entries</strong>. This action cannot be undone.
          </>
        }
        icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
        iconClassName="bg-destructive/10"
        titleClassName="text-destructive"
        maxWidth="md"
        primaryAction={{
          label: (loading) => loading ? "Deleting…" : `Delete All ${selectedIds.size}`,
          onClick: handleBulkDeleteConfirm,
          variant: "destructive",
          loading: isBulkDeleting,
          icon: <Trash2 className="h-4 w-4" />,
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setShowBulkDeleteModal(false),
        }}
      />
    </>
  );
}
