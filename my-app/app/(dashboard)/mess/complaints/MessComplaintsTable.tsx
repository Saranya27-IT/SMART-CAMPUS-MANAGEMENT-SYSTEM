"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/DataTable";
import { STATUS_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { updateMessComplaintStatus } from "@/lib/actions/mess";

type ComplaintRow = any & {
  profiles?: { full_name: string; roll_number: string };
};

interface MessComplaintsTableProps {
  complaints: ComplaintRow[];
  isManager: boolean;
}

export function MessComplaintsTable({ complaints, isManager }: MessComplaintsTableProps) {
  const columns = [
    {
      key: "category",
      header: "Category",
      cell: (row: ComplaintRow) => <Badge variant="outline" className="capitalize">{row.category}</Badge>,
    },
    {
      key: "description",
      header: "Description",
      cell: (row: ComplaintRow) => <p className="text-xs text-foreground max-w-sm">{row.description}</p>,
    },
    {
      key: "student",
      header: "Student",
      cell: (row: ComplaintRow) => (
        <div>
          <p className="text-xs font-medium">{row.profiles?.full_name ?? "Student"}</p>
          <p className="text-[10px] text-muted-foreground font-mono">{row.profiles?.roll_number}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row: ComplaintRow) => (
        <Badge className={cn("border text-xs capitalize", STATUS_COLORS[row.status])}>
          {row.status}
        </Badge>
      ),
    },
    ...(isManager
      ? [
          {
            key: "action",
            header: "Action",
            cell: (row: ComplaintRow) =>
              row.status !== "resolved" ? (
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-xs"
                  onClick={async () => {
                    await updateMessComplaintStatus(row.id, "resolved");
                  }}
                >
                  Mark Resolved
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">Resolved</span>
              ),
          },
        ]
      : []),
  ];

  return (
    <DataTable
      data={(complaints ?? []) as any[]}
      columns={columns as never}
      searchable
      searchPlaceholder="Search complaints..."
      pageSize={15}
      emptyTitle="No complaints registered"
      rowKey={(row: any) => row.id}
    />
  );
}
