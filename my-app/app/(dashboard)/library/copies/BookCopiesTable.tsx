"use client";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/DataTable";

type CopyRow = any & {
  books?: { title: string; isbn: string };
};

interface BookCopiesTableProps {
  copies: CopyRow[];
}

export function BookCopiesTable({ copies }: BookCopiesTableProps) {
  const columns = [
    {
      key: "copy_number",
      header: "Copy Number",
      cell: (row: CopyRow) => <span className="font-mono font-bold">Copy #{row.copy_number}</span>,
    },
    {
      key: "book",
      header: "Book Title",
      cell: (row: CopyRow) => row.books?.title ?? "—",
    },
    {
      key: "qr_code",
      header: "QR Code Token",
      cell: (row: CopyRow) => (
        <span className="font-mono text-xs text-muted-foreground">{row.qr_code ?? "—"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row: CopyRow) => (
        <Badge variant="outline" className={row.status === "available" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-blue-200 bg-blue-50 text-blue-700"}>
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <DataTable
      data={(copies ?? []) as any[]}
      columns={columns as never}
      searchable
      searchPlaceholder="Search copies by code or book..."
      pageSize={15}
      emptyTitle="No physical copies catalogued"
      rowKey={(row: any) => row.id}
    />
  );
}
