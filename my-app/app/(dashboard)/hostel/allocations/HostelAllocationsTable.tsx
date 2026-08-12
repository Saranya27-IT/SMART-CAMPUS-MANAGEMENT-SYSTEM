"use client";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/DataTable";

type AllocatedBed = any & {
  hostel_rooms?: { room_number: string };
  profiles?: { full_name: string; roll_number: string; email: string };
};

interface HostelAllocationsTableProps {
  beds: AllocatedBed[];
}

export function HostelAllocationsTable({ beds }: HostelAllocationsTableProps) {
  const columns = [
    {
      key: "student",
      header: "Resident Student",
      cell: (row: AllocatedBed) => (
        <div>
          <p className="font-semibold text-sm">{row.profiles?.full_name ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{row.profiles?.email}</p>
        </div>
      ),
    },
    {
      key: "roll",
      header: "Roll Number",
      cell: (row: AllocatedBed) => <span className="font-mono text-xs">{row.profiles?.roll_number ?? "—"}</span>,
    },
    {
      key: "room",
      header: "Room & Bed",
      cell: (row: AllocatedBed) => (
        <span className="font-medium text-sm">
          Room {row.hostel_rooms?.room_number} · Bed {row.bed_number}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: () => <Badge className="bg-blue-100 text-blue-700 border-blue-200">Occupied</Badge>,
    },
  ];

  return (
    <DataTable
      data={(beds ?? []) as any[]}
      columns={columns as never}
      searchable
      searchPlaceholder="Search by student name or room..."
      pageSize={15}
      emptyTitle="No beds currently allocated"
      rowKey={(row: any) => row.id}
    />
  );
}
