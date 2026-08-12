"use client";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/DataTable";
import { format } from "date-fns";

type AttendanceRow = any & {
  profiles?: { full_name: string; roll_number: string };
};

interface MessAttendanceTableProps {
  attendance: AttendanceRow[];
}

export function MessAttendanceTable({ attendance }: MessAttendanceTableProps) {
  const columns = [
    {
      key: "student",
      header: "Student",
      cell: (row: AttendanceRow) => (
        <div>
          <p className="text-sm font-medium">{row.profiles?.full_name ?? "Student"}</p>
          <p className="text-xs text-muted-foreground font-mono">{row.profiles?.roll_number}</p>
        </div>
      ),
    },
    {
      key: "meal_type",
      header: "Meal",
      cell: (row: AttendanceRow) => <span className="capitalize font-medium">{row.meal_type}</span>,
    },
    {
      key: "present",
      header: "Status",
      cell: (row: AttendanceRow) => (
        <Badge variant="outline" className={row.present ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-600"}>
          {row.present ? "Attended" : "Absent"}
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
      searchPlaceholder="Search meal attendance..."
      pageSize={15}
      emptyTitle="No meal attendance logs for today"
      rowKey={(row: any) => row.id}
    />
  );
}
