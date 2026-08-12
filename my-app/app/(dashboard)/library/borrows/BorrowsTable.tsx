"use client";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/DataTable";
import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/constants";
import { format, differenceInDays } from "date-fns";

type BorrowRow = any & {
  books?: { title: string; isbn: string };
  book_copies?: { copy_number: string; qr_code: string };
  profiles?: { full_name: string; roll_number: string };
};

interface BorrowsTableProps {
  borrows: BorrowRow[];
  isLibrarian: boolean;
}

export function BorrowsTable({ borrows, isLibrarian }: BorrowsTableProps) {
  const columns = [
    {
      key: "book",
      header: "Book",
      cell: (row: BorrowRow) => (
        <div>
          <p className="font-medium text-sm line-clamp-1">{row.books?.title ?? "—"}</p>
          <p className="text-xs text-muted-foreground font-mono">{row.book_copies?.copy_number}</p>
        </div>
      ),
    },
    ...(isLibrarian ? [{
      key: "student",
      header: "Student",
      cell: (row: BorrowRow) => (
        <div>
          <p className="text-sm font-medium">{row.profiles?.full_name}</p>
          <p className="text-xs text-muted-foreground font-mono">{row.profiles?.roll_number}</p>
        </div>
      ),
    }] : []),
    {
      key: "due_date",
      header: "Due Date",
      cell: (row: BorrowRow) => {
        const isOverdue = new Date(row.due_date) < new Date() && row.status === "borrowed";
        const daysLeft = differenceInDays(new Date(row.due_date), new Date());
        return (
          <div>
            <p className={cn("text-sm font-medium", isOverdue && "text-rose-600")}>
              {format(new Date(row.due_date), "d MMM yyyy")}
            </p>
            {row.status === "borrowed" && (
              <p className={cn("text-xs", isOverdue ? "text-rose-500" : "text-muted-foreground")}>
                {isOverdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      cell: (row: BorrowRow) => {
        const isOverdue = row.status === "borrowed" && new Date(row.due_date) < new Date();
        const displayStatus = isOverdue ? "overdue" : row.status;
        return (
          <Badge className={cn("border text-xs", STATUS_COLORS[displayStatus] ?? "")}>
            {displayStatus}
          </Badge>
        );
      },
    },
    {
      key: "fine",
      header: "Fine",
      cell: (row: BorrowRow) => (
        row.fine_amount > 0 ? (
          <span className={cn("text-sm font-medium", row.fine_paid ? "text-emerald-600" : "text-rose-600")}>
            ₹{row.fine_amount} {row.fine_paid ? "(paid)" : "(unpaid)"}
          </span>
        ) : <span className="text-muted-foreground text-sm">—</span>
      ),
    },
    {
      key: "renewals",
      header: "Renewals",
      cell: (row: BorrowRow) => (
        <span className="text-xs text-muted-foreground">{row.renewal_count} / 2</span>
      ),
    },
    {
      key: "borrowed_on",
      header: "Borrowed On",
      cell: (row: BorrowRow) => (
        <span className="text-xs text-muted-foreground">
          {format(new Date(row.created_at), "d MMM yyyy")}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      data={(borrows ?? []) as BorrowRow[]}
      columns={columns as never}
      searchable
      searchPlaceholder="Search by book title or student..."
      searchKeys={["status"] as never}
      pageSize={15}
      emptyTitle="No borrows recorded"
      emptyDescription="No active or past book borrows found."
      rowKey={(row: BorrowRow) => row.id}
    />
  );
}
