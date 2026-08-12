"use client";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/DataTable";
import { format } from "date-fns";

type AttendanceRow = any & {
  profiles?: { full_name: string; roll_number: string };
};

interface HostelAttendanceTableProps {
  attendance: AttendanceRow[];
}

export function HostelAttendanceTable({ attendance }: HostelAttendanceTableProps) {
  const columns = [
    {
      key: "student",
      header: "Student",
      cell: (row: AttendanceRow) => (
        <div>
          <p className="text-sm font-medium">{row.profiles?.full_name}</p>
          <p className="text-xs text-muted-foreground font-mono">{row.profiles?.roll_number}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Roll Call Status",
      cell: (row: AttendanceRow) => (
        <Badge variant="outline" className={row.status === "present" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: "date",
      header: "Date",
      cell: (row: AttendanceRow) => format(new Date(row.date), "d MMM yyyy"),
    },
  ];

  return (
    <DataTable
      data={(attendance ?? []) as any[]}
      columns={columns as never}
      searchable
      searchPlaceholder="Search student attendance..."
      pageSize={15}
      emptyTitle="No attendance records for today"
      emptyDescription="Night roll call has not been submitted for today."
      rowKey={(row: any) => row.id}
    />
  );
}
