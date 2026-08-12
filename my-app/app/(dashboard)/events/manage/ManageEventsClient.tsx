"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/DataTable";
import { EventFormSheet } from "@/components/events/EventFormSheet";
import { deleteEvent, updateEvent } from "@/lib/actions/events";
import { Calendar, Plus, Pencil, Trash2, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/constants";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

const STATUS_OPTIONS = ["draft", "upcoming", "ongoing", "completed", "cancelled"];

interface ManageEventsClientProps {
  events: any[];
  categories: any[];
  halls: any[];
  isAdmin: boolean;
}

export function ManageEventsClient({ events: initialEvents, categories, halls, isAdmin }: ManageEventsClientProps) {
  const [events, setEvents] = useState(initialEvents);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);

  function openCreate() {
    setEditingEvent(null);
    setSheetOpen(true);
  }

  function openEdit(event: any) {
    setEditingEvent(event);
    setSheetOpen(true);
  }

  function handleClose() {
    setSheetOpen(false);
    setEditingEvent(null);
    // Reload page to refresh events
    window.location.reload();
  }

  async function handleDelete(event: any) {
    if (!confirm(`Delete "${event.title}"? This action cannot be undone.`)) return;
    const result = await deleteEvent(event.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Event deleted.");
      setEvents((prev) => prev.filter((e) => e.id !== event.id));
    }
  }

  async function handleStatusChange(event: any, status: string) {
    const result = await updateEvent(event.id, { status });
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Status updated to "${status}".`);
      setEvents((prev) =>
        prev.map((e) => (e.id === event.id ? { ...e, status } : e))
      );
    }
  }

  const columns = [
    {
      key: "title",
      header: "Event",
      cell: (row: any) => (
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
            <Calendar className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <Link href={`/events/${row.id}`} className="font-semibold text-sm hover:text-primary transition-colors truncate block">
              {row.title}
            </Link>
            <p className="text-xs text-muted-foreground truncate">{row.venue}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      cell: (row: any) => {
        const cat = row.event_categories;
        return cat ? (
          <Badge
            className="text-xs text-white border-0"
            style={{ backgroundColor: cat.color ?? "#6366F1" }}
          >
            {cat.name}
          </Badge>
        ) : <span className="text-muted-foreground text-xs">—</span>;
      },
    },
    {
      key: "date",
      header: "Date & Time",
      cell: (row: any) => (
        <div className="text-xs">
          <p className="font-medium">{format(new Date(row.start_time), "d MMM yyyy")}</p>
          <p className="text-muted-foreground">{format(new Date(row.start_time), "h:mm a")}</p>
        </div>
      ),
    },
    {
      key: "capacity",
      header: "Capacity",
      cell: (row: any) => (
        <span className="text-sm tabular-nums">{row.capacity}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row: any) => (
        <Badge variant="outline" className={cn("text-xs capitalize", STATUS_COLORS[row.status])}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (row: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            id={`event-menu-${row.id}`}
          >
            <MoreVertical className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => openEdit(row)} id={`edit-event-${row.id}`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Event
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Change Status</p>
            {STATUS_OPTIONS.filter((s) => s !== row.status).map((s) => (
              <DropdownMenuItem
                key={s}
                onClick={() => handleStatusChange(row, s)}
                className="capitalize text-xs"
              >
                → {s}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDelete(row)}
              className="text-rose-600 focus:text-rose-600 focus:bg-rose-50"
              id={`delete-event-${row.id}`}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Event
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <DataTable
        data={events as any[]}
        columns={columns as never}
        searchable
        searchPlaceholder="Search events..."
        searchKeys={["title", "venue"] as never}
        pageSize={15}
        emptyTitle="No events yet"
        emptyDescription="Create your first event using the button above."
        rowKey={(row: any) => row.id}
        actions={
          <Button
            className="gradient-primary text-white border-0 hover:opacity-90"
            onClick={openCreate}
            id="create-event-btn"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        }
      />

      <EventFormSheet
        open={sheetOpen}
        onOpenChange={(v) => !v && handleClose()}
        event={editingEvent}
        categories={categories}
        halls={halls}
      />
    </>
  );
}
