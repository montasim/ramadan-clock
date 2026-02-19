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
import { Pencil, Trash2, CheckSquare, Square } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface CalendarViewProps {
  entries: TimeEntry[];
}

const today = new Date().toISOString().split("T")[0];

export function CalendarView({ entries }: CalendarViewProps) {
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [formData, setFormData] = useState({
    date: "",
    sehri: "",
    iftar: "",
    location: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    setIsDeleting(true);
    const result = await deleteTimeEntry(id);
    setIsDeleting(false);

    if (result.success) {
      toast.success("Entry deleted successfully");
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      toast.error(result.error || "Failed to delete entry");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(entries.map((e) => e.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedIds.size} entries?`)) return;

    setIsBulkDeleting(true);
    let successCount = 0;
    let failCount = 0;

    for (const id of selectedIds) {
      const result = await deleteTimeEntry(id);
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    setIsBulkDeleting(false);
    setSelectedIds(new Set());

    if (successCount > 0) {
      toast.success(`Deleted ${successCount} entries`);
    }
    if (failCount > 0) {
      toast.error(`Failed to delete ${failCount} entries`);
    }
  };

  const isAllSelected = entries.length > 0 && selectedIds.size === entries.length;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < entries.length;

  return (
    <>
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between mb-4 p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {selectedIds.size} entry{selectedIds.size > 1 ? "ies" : "y"} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            disabled={isBulkDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isBulkDeleting ? "Deleting..." : `Delete Selected (${selectedIds.size})`}
          </Button>
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="w-[150px]">Date</TableHead>
              <TableHead>Sehri</TableHead>
              <TableHead>Iftar</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => {
              const isToday = entry.date === today;
              const entryDate = new Date(entry.date);
              const isPast = entryDate < new Date(today);
              const isSelected = selectedIds.has(entry.id);

              return (
                <TableRow
                  key={entry.id}
                  className={isToday ? "bg-primary/5" : ""}
                >
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) =>
                        handleSelectOne(entry.id, checked as boolean)
                      }
                      aria-label={`Select entry for ${entry.date}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {new Date(entry.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {isToday && (
                      <Badge variant="default" className="ml-2">
                        Today
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{entry.sehri}</TableCell>
                  <TableCell>{entry.iftar}</TableCell>
                  <TableCell>{entry.location || "-"}</TableCell>
                  <TableCell className="text-center">
                    {isPast ? (
                      <Badge variant="secondary">Past</Badge>
                    ) : isToday ? (
                      <Badge variant="default">Today</Badge>
                    ) : (
                      <Badge variant="outline">Upcoming</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(entry)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(entry.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingEntry} onOpenChange={() => setEditingEntry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Entry</DialogTitle>
            <DialogDescription>
              Update the Sehri & Iftar times for this date
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sehri">Sehri Time</Label>
              <Input
                id="sehri"
                type="time"
                value={formData.sehri}
                onChange={(e) =>
                  setFormData({ ...formData, sehri: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="iftar">Iftar Time</Label>
              <Input
                id="iftar"
                type="time"
                value={formData.iftar}
                onChange={(e) =>
                  setFormData({ ...formData, iftar: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="e.g., Dhaka"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingEntry(null)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
