"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/DataTable";
import { markFeePaid } from "@/lib/actions/hostel";

type FeeRow = any & {
  profiles?: { full_name: string; roll_number: string };
};

interface HostelFeesTableProps {
  fees: FeeRow[];
  isWarden: boolean;
}

export function HostelFeesTable({ fees, isWarden }: HostelFeesTableProps) {
  const columns = [
    {
      key: "student",
      header: "Student",
      cell: (row: FeeRow) => (
        <div>
          <p className="text-sm font-medium">{row.profiles?.full_name ?? "Student"}</p>
          <p className="text-xs text-muted-foreground font-mono">{row.profiles?.roll_number}</p>
        </div>
      ),
    },
    {
      key: "period",
      header: "Billing Period",
      cell: (row: FeeRow) => row.period,
    },
    {
      key: "amount",
      header: "Amount",
      cell: (row: FeeRow) => <span className="font-bold">₹{row.amount}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (row: FeeRow) => (
        <Badge variant="outline" className={row.paid ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}>
          {row.paid ? "Paid" : "Unpaid"}
        </Badge>
      ),
    },
    ...(isWarden
      ? [
          {
            key: "action",
            header: "Action",
            cell: (row: FeeRow) =>
              !row.paid ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={async () => {
                    await markFeePaid(row.id);
                  }}
                >
                  Mark Paid
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">Paid</span>
              ),
          },
        ]
      : []),
  ];

  return (
    <DataTable
      data={(fees ?? []) as any[]}
      columns={columns as never}
      searchable
      searchPlaceholder="Search fee records..."
      pageSize={15}
      emptyTitle="No hostel fee records"
      rowKey={(row: any) => row.id}
    />
  );
}
