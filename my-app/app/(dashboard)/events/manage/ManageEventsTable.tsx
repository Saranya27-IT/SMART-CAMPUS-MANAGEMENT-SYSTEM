"use client";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/DataTable";
import { Calendar } from "lucide-react";
import { format } from "date-fns";

type EventRow = any & {
  event_categories?: { name: string; color: string };
};

interface ManageEventsTableProps {
  events: EventRow[];
}

export function ManageEventsTable({ events }: ManageEventsTableProps) {
  const columns = [
    {
      key: "title",
      header: "Event Title",
      cell: (row: EventRow) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="font-semibold">{row.title}</span>
        </div>
      ),
    },
    {
      key: "venue",
      header: "Venue",
      cell: (row: EventRow) => row.venue,
    },
    {
      key: "date",
      header: "Date & Time",
      cell: (row: EventRow) => format(new Date(row.start_time), "d MMM yyyy, h:mm a"),
    },
    {
      key: "capacity",
      header: "Capacity",
      cell: (row: EventRow) => row.capacity,
    },
    {
      key: "status",
      header: "Status",
      cell: (row: EventRow) => (
        <Badge variant="outline" className="capitalize">
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <DataTable
      data={(events ?? []) as any[]}
      columns={columns as never}
      searchable
      searchPlaceholder="Search events..."
      searchKeys={["title", "venue"] as never}
      pageSize={15}
      emptyTitle="No events created"
      rowKey={(row: any) => row.id}
    />
  );
}
