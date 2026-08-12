"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/DataTable";
import { markFinePaid } from "@/lib/actions/library";

type FineRow = any & {
  books?: { title: string };
  profiles?: { full_name: string; roll_number: string };
};

interface LibraryFinesTableProps {
  fineBorrows: FineRow[];
  isLibrarian: boolean;
}

export function LibraryFinesTable({ fineBorrows, isLibrarian }: LibraryFinesTableProps) {
  const columns = [
    {
      key: "book",
      header: "Book Title",
      cell: (row: FineRow) => <span className="font-medium">{row.books?.title ?? "—"}</span>,
    },
    {
      key: "student",
      header: "Student",
      cell: (row: FineRow) => (
        <div>
          <p className="text-sm font-medium">{row.profiles?.full_name}</p>
          <p className="text-xs text-muted-foreground">{row.profiles?.roll_number}</p>
        </div>
      ),
    },
    {
      key: "fine_amount",
      header: "Amount",
      cell: (row: FineRow) => <span className="font-bold text-rose-600">₹{row.fine_amount}</span>,
    },
    {
      key: "status",
      header: "Payment Status",
      cell: (row: FineRow) => (
        <Badge variant="outline" className={row.fine_paid ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}>
          {row.fine_paid ? "Paid" : "Unpaid"}
        </Badge>
      ),
    },
    ...(isLibrarian
      ? [
          {
            key: "action",
            header: "Action",
            cell: (row: FineRow) =>
              !row.fine_paid ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={async () => {
                    await markFinePaid(row.id);
                  }}
                >
                  Mark Paid
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">Cleared</span>
              ),
          },
        ]
      : []),
  ];

  return (
    <DataTable
      data={(fineBorrows ?? []) as any[]}
      columns={columns as never}
      searchable
      searchPlaceholder="Search fine records..."
      pageSize={15}
      emptyTitle="No fine records"
      emptyDescription="There are currently no outstanding or paid fines."
      rowKey={(row: any) => row.id}
    />
  );
}
