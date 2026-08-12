"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { createEvent, updateEvent } from "@/lib/actions/events";
import { toast } from "sonner";
import { Loader2, CalendarDays } from "lucide-react";

interface EventFormSheetProps {
  open: boolean;
  onClose: () => void;
  event?: any;           // Existing event for edit
  categories: any[];
  halls: any[];
}

const EVENT_STATUSES = ["draft", "upcoming", "ongoing", "completed", "cancelled"];

export function EventFormSheet({ open, onClose, event, categories, halls }: EventFormSheetProps) {
  const isEditing = !!event;
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    title: event?.title ?? "",
    description: event?.description ?? "",
    category_id: event?.category_id ?? "",
    hall_id: event?.hall_id ?? "",
    venue: event?.venue ?? "",
    start_time: event?.start_time
      ? new Date(event.start_time).toISOString().slice(0, 16)
      : "",
    end_time: event?.end_time
      ? new Date(event.end_time).toISOString().slice(0, 16)
      : "",
    capacity: event?.capacity ?? 100,
    registration_deadline: event?.registration_deadline
      ? new Date(event.registration_deadline).toISOString().slice(0, 16)
      : "",
    status: event?.status ?? "upcoming",
    is_public: event?.is_public ?? true,
    allow_faculty: event?.allow_faculty ?? true,
  });

  function handleHallChange(hallId: string) {
    const hall = halls.find((h) => h.id === hallId);
    setForm((prev) => ({
      ...prev,
      hall_id: hallId,
      venue: hall ? `${hall.name}, ${hall.location}` : prev.venue,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Event title is required."); return; }
    if (!form.venue.trim()) { toast.error("Venue is required."); return; }
    if (!form.start_time)   { toast.error("Start time is required."); return; }
    if (!form.end_time)     { toast.error("End time is required."); return; }
    if (new Date(form.end_time) <= new Date(form.start_time)) {
      toast.error("End time must be after start time."); return;
    }

    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      category_id: form.category_id || null,
      hall_id: form.hall_id || null,
      venue: form.venue.trim(),
      start_time: new Date(form.start_time).toISOString(),
      end_time: new Date(form.end_time).toISOString(),
      capacity: Number(form.capacity),
      registration_deadline: form.registration_deadline ? new Date(form.registration_deadline).toISOString() : null,
      status: form.status,
      is_public: form.is_public,
      allow_faculty: form.allow_faculty,
    };

    startTransition(async () => {
      const result = isEditing
        ? await updateEvent(event.id, payload)
        : await createEvent(payload);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(isEditing ? "Event updated successfully." : "Event created successfully.");
        onClose();
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
              <CalendarDays className="h-5 w-5 text-white" />
            </div>
            <div>
              <SheetTitle>{isEditing ? "Edit Event" : "Create New Event"}</SheetTitle>
              <SheetDescription className="text-xs">
                {isEditing ? "Update the event details below." : "Fill in the details to create a new campus event."}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="event-title">Event Title <span className="text-rose-500">*</span></Label>
            <Input
              id="event-title"
              placeholder="e.g. Annual Cultural Fest 2026"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              disabled={isPending}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="event-description">Description</Label>
            <Textarea
              id="event-description"
              placeholder="Describe the event..."
              rows={3}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              disabled={isPending}
            />
          </div>

          {/* Category + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={form.category_id}
                onValueChange={(v) => setForm((p) => ({ ...p, category_id: v }))}
                disabled={isPending}
              >
                <SelectTrigger id="event-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}
                disabled={isPending}
              >
                <SelectTrigger id="event-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Hall selector */}
          <div className="space-y-1.5">
            <Label>Hall / Venue</Label>
            <Select
              value={form.hall_id}
              onValueChange={handleHallChange}
              disabled={isPending}
            >
              <SelectTrigger id="event-hall">
                <SelectValue placeholder="Select a hall (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Custom venue (enter below)</SelectItem>
                {halls.map((hall) => (
                  <SelectItem key={hall.id} value={hall.id}>
                    {hall.name} (capacity: {hall.capacity})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Venue text */}
          <div className="space-y-1.5">
            <Label htmlFor="event-venue">Venue Description <span className="text-rose-500">*</span></Label>
            <Input
              id="event-venue"
              placeholder="e.g. Main Auditorium, Block A"
              value={form.venue}
              onChange={(e) => setForm((p) => ({ ...p, venue: e.target.value }))}
              disabled={isPending}
            />
          </div>

          {/* Start + End time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="event-start">Start Time <span className="text-rose-500">*</span></Label>
              <Input
                id="event-start"
                type="datetime-local"
                value={form.start_time}
                onChange={(e) => setForm((p) => ({ ...p, start_time: e.target.value }))}
                disabled={isPending}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="event-end">End Time <span className="text-rose-500">*</span></Label>
              <Input
                id="event-end"
                type="datetime-local"
                value={form.end_time}
                onChange={(e) => setForm((p) => ({ ...p, end_time: e.target.value }))}
                disabled={isPending}
              />
            </div>
          </div>

          {/* Capacity + Deadline */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="event-capacity">Capacity</Label>
              <Input
                id="event-capacity"
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) => setForm((p) => ({ ...p, capacity: Number(e.target.value) }))}
                disabled={isPending}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="event-deadline">Registration Deadline</Label>
              <Input
                id="event-deadline"
                type="datetime-local"
                value={form.registration_deadline}
                onChange={(e) => setForm((p) => ({ ...p, registration_deadline: e.target.value }))}
                disabled={isPending}
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-6 text-sm pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded"
                checked={form.is_public}
                onChange={(e) => setForm((p) => ({ ...p, is_public: e.target.checked }))}
                disabled={isPending}
                id="event-public"
              />
              <span>Public event</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded"
                checked={form.allow_faculty}
                onChange={(e) => setForm((p) => ({ ...p, allow_faculty: e.target.checked }))}
                disabled={isPending}
                id="event-allow-faculty"
              />
              <span>Allow faculty</span>
            </label>
          </div>

          <SheetFooter className="pt-4 gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending} id="event-form-cancel-btn">
              Cancel
            </Button>
            <Button
              type="submit"
              className="gradient-primary text-white border-0 hover:opacity-90 flex-1"
              disabled={isPending}
              id="event-form-submit-btn"
            >
              {isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isEditing ? "Saving..." : "Creating..."}</>
              ) : (
                isEditing ? "Save Changes" : "Create Event"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
