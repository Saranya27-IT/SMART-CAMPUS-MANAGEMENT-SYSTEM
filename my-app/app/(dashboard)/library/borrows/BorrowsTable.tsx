"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookMarked, Plus, RotateCw, CheckCircle2, AlertCircle, Loader2, Search, Calendar } from "lucide-react";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { borrowBook, returnBook, renewBook } from "@/lib/actions/library";
import { cn } from "@/lib/utils";
import { STATUS_COLORS, LIBRARY } from "@/lib/constants";
import { format, differenceInDays, addDays } from "date-fns";

type BorrowRow = {
  id: string;
  copy_id: string;
  book_id: string;
  student_id: string;
  due_date: string;
  return_date: string | null;
  renewal_count: number;
  fine_amount: number;
  fine_paid: boolean;
  status: string;
  computedStatus?: string;
  notes?: string | null;
  created_at: string;
  books?: { title: string; isbn: string };
  book_copies?: { copy_number: string; qr_code: string; status: string };
  profiles?: { id: string; full_name: string; roll_number: string; email: string };
};

interface BorrowsTableProps {
  borrows: BorrowRow[];
  profiles: { id: string; full_name: string; roll_number?: string; email: string; role: string }[];
  books: { id: string; title: string; available_copies: number }[];
  copies: { id: string; book_id: string; copy_number: string; status: string }[];
  isLibrarian: boolean;
}

export function BorrowsTable({ borrows, profiles, books, copies, isLibrarian }: BorrowsTableProps) {
  const router = useRouter();

  // Issue modal state
  const [issueOpen, setIssueOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedBookId, setSelectedBookId] = useState("");
  const [selectedCopyId, setSelectedCopyId] = useState("");
  const [dueDate, setDueDate] = useState(format(addDays(new Date(), LIBRARY.BORROW_DAYS), "yyyy-MM-dd"));
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Return dialog state
  const [returnOpen, setReturnOpen] = useState(false);
  const [targetBorrow, setTargetBorrow] = useState<BorrowRow | null>(null);
  const [returnNotes, setReturnNotes] = useState("");

  // Status Filter tab
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "overdue" | "returned">("all");

  const availableBooks = books.filter((b) => b.available_copies > 0);
  const availableCopiesForBook = copies.filter((c) => c.book_id === selectedBookId && c.status === "available");

  function handleOpenIssue() {
    setSelectedStudentId(profiles[0]?.id || "");
    const defaultBook = availableBooks[0]?.id || "";
    setSelectedBookId(defaultBook);
    const defaultCopy = copies.find((c) => c.book_id === defaultBook && c.status === "available")?.id || "";
    setSelectedCopyId(defaultCopy);
    setDueDate(format(addDays(new Date(), LIBRARY.BORROW_DAYS), "yyyy-MM-dd"));
    setNotes("");
    setError(null);
    setIssueOpen(true);
  }

  function handleBookChange(bookId: string) {
    setSelectedBookId(bookId);
    const matchCopy = copies.find((c) => c.book_id === bookId && c.status === "available")?.id || "";
    setSelectedCopyId(matchCopy);
  }

  async function handleIssueSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudentId || !selectedBookId || !selectedCopyId || !dueDate) {
      setError("Please select student/faculty, book, physical copy, and due date.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await borrowBook({
      student_id: selectedStudentId,
      book_id: selectedBookId,
      copy_id: selectedCopyId,
      due_date: dueDate,
      notes: notes.trim() || undefined,
    });

    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      setIssueOpen(false);
      router.refresh();
    }
  }

  async function handleReturnConfirm() {
    if (!targetBorrow) return;

    setLoading(true);
    setError(null);

    const res = await returnBook(targetBorrow.id, returnNotes.trim() || undefined);
    setLoading(false);

    if (res.error) {
      setError(res.error);
      setReturnOpen(false);
    } else {
      setReturnOpen(false);
      router.refresh();
    }
  }

  async function handleRenew(borrowId: string) {
    setLoading(true);
    setError(null);

    const res = await renewBook(borrowId);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      router.refresh();
    }
  }

  const filteredBorrows = borrows.filter((borrow) => {
    const isOverdue =
      borrow.status === "overdue" ||
      (borrow.status === "borrowed" && new Date(borrow.due_date) < new Date());

    if (statusFilter === "active") return borrow.status === "borrowed" && !isOverdue;
    if (statusFilter === "overdue") return isOverdue;
    if (statusFilter === "returned") return borrow.status === "returned";
    return true;
  });

  const columns = [
    {
      key: "book",
      header: "Book Details",
      cell: (row: BorrowRow) => (
        <div>
          <p className="font-semibold text-sm line-clamp-1">{row.books?.title ?? "Untitled Book"}</p>
          <p className="text-xs font-mono text-muted-foreground mt-0.5">
            Copy #{row.book_copies?.copy_number || "—"} {row.books?.isbn ? `· ISBN: ${row.books.isbn}` : ""}
          </p>
        </div>
      ),
    },
    {
      key: "borrower",
      header: "Borrower",
      cell: (row: BorrowRow) => (
        <div>
          <p className="text-sm font-medium">{row.profiles?.full_name || "—"}</p>
          <p className="text-xs text-muted-foreground font-mono">
            {row.profiles?.roll_number || row.profiles?.email || ""}
          </p>
        </div>
      ),
    },
    {
      key: "due_date",
      header: "Due Date & Timeline",
      cell: (row: BorrowRow) => {
        const isOverdue = new Date(row.due_date) < new Date() && row.status !== "returned";
        const daysDiff = differenceInDays(new Date(row.due_date), new Date());

        return (
          <div>
            <p className={cn("text-sm font-medium", isOverdue && "text-rose-600 font-bold")}>
              {format(new Date(row.due_date), "dd MMM yyyy")}
            </p>
            {row.status === "returned" ? (
              <p className="text-xs text-emerald-600">Returned on {row.return_date}</p>
            ) : (
              <p className={cn("text-xs font-medium", isOverdue ? "text-rose-600" : "text-muted-foreground")}>
                {isOverdue ? `${Math.abs(daysDiff)} days overdue` : `${daysDiff} days remaining`}
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
          <Badge className={cn("border text-xs capitalize font-medium", STATUS_COLORS[displayStatus] ?? "")}>
            {displayStatus}
          </Badge>
        );
      },
    },
    {
      key: "fine",
      header: "Fine Incurred",
      cell: (row: BorrowRow) => {
        const amt = Number(row.fine_amount || 0);
        if (amt === 0) return <span className="text-xs text-muted-foreground">—</span>;
        return (
          <span className={cn("text-xs font-bold tabular-nums", row.fine_paid ? "text-emerald-600" : "text-rose-600")}>
            ₹{amt} {row.fine_paid ? "(Paid)" : "(Pending)"}
          </span>
        );
      },
    },
    {
      key: "renewals",
      header: "Renewals",
      cell: (row: BorrowRow) => (
        <span className="text-xs font-mono text-muted-foreground">
          {row.renewal_count || 0} / {LIBRARY.MAX_RENEWALS}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (row: BorrowRow) => {
        const canRenew =
          row.status === "borrowed" && (row.renewal_count || 0) < LIBRARY.MAX_RENEWALS;

        return (
          <div className="flex items-center justify-end gap-1">
            {canRenew && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1"
                onClick={() => handleRenew(row.id)}
              >
                <RotateCw className="h-3.5 w-3.5" />
                Renew
              </Button>
            )}

            {isLibrarian && row.status !== "returned" && (
              <Button
                size="sm"
                className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                onClick={() => {
                  setTargetBorrow(row);
                  setReturnNotes("");
                  setReturnOpen(true);
                }}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Return
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {error && <div className="p-3 text-sm rounded-lg bg-rose-50 text-rose-700 border border-rose-200">{error}</div>}

      {/* Toolbar & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border">
        <div className="flex items-center gap-1 border rounded-lg p-1 bg-muted/40 self-start">
          <Button
            variant={statusFilter === "all" ? "secondary" : "ghost"}
            size="sm"
            className="text-xs h-7 px-3"
            onClick={() => setStatusFilter("all")}
          >
            All Borrows ({borrows.length})
          </Button>
          <Button
            variant={statusFilter === "active" ? "secondary" : "ghost"}
            size="sm"
            className="text-xs h-7 px-3"
            onClick={() => setStatusFilter("active")}
          >
            Active
          </Button>
          <Button
            variant={statusFilter === "overdue" ? "secondary" : "ghost"}
            size="sm"
            className="text-xs h-7 px-3 text-rose-600"
            onClick={() => setStatusFilter("overdue")}
          >
            Overdue
          </Button>
          <Button
            variant={statusFilter === "returned" ? "secondary" : "ghost"}
            size="sm"
            className="text-xs h-7 px-3 text-emerald-600"
            onClick={() => setStatusFilter("returned")}
          >
            Returned
          </Button>
        </div>

        {isLibrarian && (
          <Button onClick={handleOpenIssue} className="gradient-primary text-white border-0" id="issue-book-btn">
            <BookMarked className="mr-2 h-4 w-4" />
            Issue Book
          </Button>
        )}
      </div>

      <DataTable
        data={filteredBorrows}
        columns={columns as never}
        searchable
        searchPlaceholder="Search borrows by book title, borrower, or status..."
        pageSize={12}
        emptyTitle="No borrowing records found"
        emptyDescription="Book loan activities will appear here."
        rowKey={(row: BorrowRow) => row.id}
      />

      {/* Issue Book Dialog */}
      <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Issue Book to Student / Faculty</DialogTitle>
            <DialogDescription>Select borrower, book title, available copy code, and due date.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleIssueSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="borrower-select">Borrower (Student / Faculty) *</Label>
              <Select value={selectedStudentId} onValueChange={(val) => setSelectedStudentId(val || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select borrower..." />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {profiles.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.full_name} ({p.roll_number || p.email}) — <span className="capitalize">{p.role}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="book-select">Select Book *</Label>
              <Select value={selectedBookId} onValueChange={(val) => handleBookChange(val || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select book..." />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {availableBooks.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.title} ({b.available_copies} avail)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="copy-select">Available Physical Copy *</Label>
              <Select value={selectedCopyId} onValueChange={(val) => setSelectedCopyId(val || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select copy code..." />
                </SelectTrigger>
                <SelectContent>
                  {availableCopiesForBook.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No available copies
                    </SelectItem>
                  ) : (
                    availableCopiesForBook.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        Copy #{c.copy_number}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due-date">Due Date *</Label>
              <Input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue-notes">Notes</Label>
              <Input
                id="issue-notes"
                placeholder="Optional loan notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIssueOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="gradient-primary text-white border-0">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Issue Book"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Return Confirmation Dialog */}
      <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Book Copy</DialogTitle>
            <DialogDescription>
              Confirm return of <span className="font-semibold">{targetBorrow?.books?.title}</span> (Copy #{targetBorrow?.book_copies?.copy_number})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {targetBorrow && new Date(targetBorrow.due_date) < new Date() && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" /> Overdue Fine Incurred
                </p>
                <p>
                  This book is {differenceInDays(new Date(), new Date(targetBorrow.due_date))} days overdue. Fine will be calculated at ₹{LIBRARY.FINE_PER_DAY}/day.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="return-notes">Condition / Return Remarks</Label>
              <Input
                id="return-notes"
                placeholder="e.g. Returned in good condition..."
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReturnConfirm} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Confirm Return"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
