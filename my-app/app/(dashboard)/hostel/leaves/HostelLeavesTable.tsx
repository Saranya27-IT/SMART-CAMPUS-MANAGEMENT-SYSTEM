"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/DataTable";
import { STATUS_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { approveLeaveRequest } from "@/lib/actions/hostel";

type LeaveRow = any & {
  profiles?: { full_name: string; roll_number: string };
};

interface HostelLeavesTableProps {
  leaves: LeaveRow[];
  isWarden: boolean;
}

export function HostelLeavesTable({ leaves, isWarden }: HostelLeavesTableProps) {
  const columns = [
    {
      key: "student",
      header: "Student",
      cell: (row: LeaveRow) => (
        <div>
          <p className="text-sm font-medium">{row.profiles?.full_name ?? "Student"}</p>
          <p className="text-xs text-muted-foreground font-mono">{row.profiles?.roll_number}</p>
        </div>
      ),
    },
    {
      key: "dates",
      header: "Leave Dates",
      cell: (row: LeaveRow) => (
        <span className="text-xs font-medium">
          {format(new Date(row.from_date), "d MMM")} – {format(new Date(row.to_date), "d MMM yyyy")}
        </span>
      ),
    },
    {
      key: "reason",
      header: "Reason",
      cell: (row: LeaveRow) => <p className="text-xs text-muted-foreground max-w-xs truncate">{row.reason}</p>,
    },
    {
      key: "status",
      header: "Status",
      cell: (row: LeaveRow) => (
        <Badge className={cn("border text-xs capitalize", STATUS_COLORS[row.status])}>
          {row.status}
        </Badge>
      ),
    },
    ...(isWarden
      ? [
          {
            key: "action",
            header: "Action",
            cell: (row: LeaveRow) =>
              row.status === "pending" ? (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-xs"
                    onClick={async () => {
                      await approveLeaveRequest(row.id, "approved");
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-rose-600 border-rose-200 h-7 text-xs"
                    onClick={async () => {
                      await approveLeaveRequest(row.id, "rejected");
                    }}
                  >
                    Reject
                  </Button>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Processed</span>
              ),
          },
        ]
      : []),
  ];

  return (
    <DataTable
      data={(leaves ?? []) as any[]}
      columns={columns as never}
      searchable
      searchPlaceholder="Search leave requests..."
      pageSize={15}
      emptyTitle="No leave requests"
      rowKey={(row: any) => row.id}
    />
  );
}
