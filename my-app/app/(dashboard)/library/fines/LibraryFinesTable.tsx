"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IndianRupee, CheckCircle2, ShieldOff, Loader2, Search } from "lucide-react";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { payFine, waiveFine } from "@/lib/actions/library";
import { cn } from "@/lib/utils";
import { format, differenceInDays } from "date-fns";

type FineRow = {
  id: string;
  due_date: string;
  return_date: string | null;
  fine_amount: number;
  fine_paid: boolean;
  fine_status?: string;
  books?: { title: string; isbn: string };
  book_copies?: { copy_number: string };
  profiles?: { full_name: string; roll_number: string; email: string; department?: string };
};

interface LibraryFinesTableProps {
  fineBorrows: FineRow[];
  isLibrarian: boolean;
}

export function LibraryFinesTable({ fineBorrows, isLibrarian }: LibraryFinesTableProps) {
  const router = useRouter();

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Waive dialog
  const [waiveOpen, setWaiveOpen] = useState(false);
  const [targetFine, setTargetFine] = useState<FineRow | null>(null);

  // Filter
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "paid">("all");

  async function handlePay(id: string) {
    setLoadingId(id);
    setError(null);
    const res = await payFine(id);
    setLoadingId(null);

    if (res.error) {
      setError(res.error);
    } else {
      router.refresh();
    }
  }

  async function handleWaiveConfirm() {
    if (!targetFine) return;

    setLoadingId(targetFine.id);
    setError(null);

    const res = await waiveFine(targetFine.id);
    setLoadingId(null);

    if (res.error) {
      setError(res.error);
      setWaiveOpen(false);
    } else {
      setWaiveOpen(false);
      router.refresh();
    }
  }

  const filteredFines = fineBorrows.filter((row) => {
    if (statusFilter === "pending") return !row.fine_paid && row.fine_amount > 0;
    if (statusFilter === "paid") return row.fine_paid;
    return true;
  });

  const columns = [
    {
      key: "book",
      header: "Book Details",
      cell: (row: FineRow) => (
        <div>
          <p className="font-semibold text-sm line-clamp-1">{row.books?.title ?? "Untitled Book"}</p>
          <p className="text-xs font-mono text-muted-foreground">Copy #{row.book_copies?.copy_number || "—"}</p>
        </div>
      ),
    },
    {
      key: "borrower",
      header: "Borrower",
      cell: (row: FineRow) => (
        <div>
          <p className="text-sm font-medium">{row.profiles?.full_name || "—"}</p>
          <p className="text-xs text-muted-foreground font-mono">
            {row.profiles?.roll_number || row.profiles?.email || ""}
          </p>
        </div>
      ),
    },
    {
      key: "due_return",
      header: "Due / Return Date",
      cell: (row: FineRow) => (
        <div className="text-xs">
          <p className="text-muted-foreground">Due: {format(new Date(row.due_date), "dd MMM yyyy")}</p>
          <p className="font-medium">
            Returned: {row.return_date ? format(new Date(row.return_date), "dd MMM yyyy") : "Not Returned"}
          </p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Fine Amount",
      cell: (row: FineRow) => (
        <span className="font-bold text-sm tabular-nums text-rose-600">₹{row.fine_amount}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row: FineRow) => {
        if (row.fine_amount === 0 && row.fine_paid) {
          return (
            <Badge variant="outline" className="border-cyan-200 bg-cyan-50 text-cyan-700 text-xs">
              Waived
            </Badge>
          );
        }
        return (
          <Badge
            variant="outline"
            className={cn(
              "text-xs capitalize font-medium",
              row.fine_paid
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            )}
          >
            {row.fine_paid ? "Paid" : "Pending"}
          </Badge>
        );
      },
    },
    ...(isLibrarian
      ? [
          {
            key: "actions",
            header: "",
            cell: (row: FineRow) => (
              <div className="flex items-center justify-end gap-1">
                {!row.fine_paid && (
                  <>
                    <Button
                      size="sm"
                      className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                      disabled={loadingId === row.id}
                      onClick={() => handlePay(row.id)}
                    >
                      {loadingId === row.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                      Mark Paid
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 gap-1"
                      onClick={() => {
                        setTargetFine(row);
                        setWaiveOpen(true);
                      }}
                    >
                      <ShieldOff className="h-3.5 w-3.5" />
                      Waive
                    </Button>
                  </>
                )}
                {row.fine_paid && <span className="text-xs text-muted-foreground font-medium">Cleared</span>}
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      {error && <div className="p-3 text-sm rounded-lg bg-rose-50 text-rose-700 border border-rose-200">{error}</div>}

      {/* Filter tabs */}
      <div className="flex items-center gap-1 border rounded-lg p-1 bg-card w-fit">
        <Button
          variant={statusFilter === "all" ? "secondary" : "ghost"}
          size="sm"
          className="text-xs h-7 px-3"
          onClick={() => setStatusFilter("all")}
        >
          All Fine Records ({fineBorrows.length})
        </Button>
        <Button
          variant={statusFilter === "pending" ? "secondary" : "ghost"}
          size="sm"
          className="text-xs h-7 px-3 text-rose-600"
          onClick={() => setStatusFilter("pending")}
        >
          Pending
        </Button>
        <Button
          variant={statusFilter === "paid" ? "secondary" : "ghost"}
          size="sm"
          className="text-xs h-7 px-3 text-emerald-600"
          onClick={() => setStatusFilter("paid")}
        >
          Paid / Cleared
        </Button>
      </div>

      <DataTable
        data={filteredFines}
        columns={columns as never}
        searchable
        searchPlaceholder="Search fines by book title or borrower..."
        pageSize={12}
        emptyTitle="No fine records"
        emptyDescription="There are currently no fine records under this filter."
        rowKey={(row: FineRow) => row.id}
      />

      {/* Waive Confirmation Dialog */}
      <ConfirmDialog
        open={waiveOpen}
        onOpenChange={setWaiveOpen}
        title="Waive Overdue Fine"
        description={`Are you sure you want to waive the ₹${targetFine?.fine_amount} fine for "${targetFine?.books?.title}"?`}
        confirmLabel="Waive Fine"
        variant="destructive"
        loading={loadingId === targetFine?.id}
        onConfirm={handleWaiveConfirm}
      />
    </div>
  );
}
