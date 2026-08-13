"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Layers, Plus, Pencil, Trash2, Loader2, QrCode, BookOpen } from "lucide-react";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { createBookCopy, updateBookCopyStatus, deleteBookCopy } from "@/lib/actions/library";
import { cn } from "@/lib/utils";

type CopyRow = {
  id: string;
  book_id: string;
  copy_number: string;
  qr_code: string | null;
  status: string;
  location?: string | null;
  condition?: string | null;
  books?: { id: string; title: string; isbn: string | null };
};

interface BookCopiesTableProps {
  copies: CopyRow[];
  books: { id: string; title: string }[];
  isLibrarian: boolean;
}

export function BookCopiesTable({ copies, books, isLibrarian }: BookCopiesTableProps) {
  const router = useRouter();

  const [addOpen, setAddOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState("");
  const [copyNumber, setCopyNumber] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Status edit
  const [statusOpen, setStatusOpen] = useState(false);
  const [editingCopy, setEditingCopy] = useState<CopyRow | null>(null);
  const [newStatus, setNewStatus] = useState("available");

  // Delete
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingCopy, setDeletingCopy] = useState<CopyRow | null>(null);

  function handleOpenAdd() {
    setSelectedBookId(books[0]?.id || "");
    setCopyNumber(`CC-${String(copies.length + 1).padStart(3, "0")}`);
    setQrCode("");
    setError(null);
    setAddOpen(true);
  }

  async function handleAddCopy(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBookId || !copyNumber.trim()) return;

    setLoading(true);
    setError(null);

    const res = await createBookCopy({
      book_id: selectedBookId,
      copy_number: copyNumber.trim(),
      qr_code: qrCode.trim() || undefined,
      status: "available",
    });

    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      setAddOpen(false);
      router.refresh();
    }
  }

  async function handleUpdateStatus(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCopy) return;

    setLoading(true);
    setError(null);

    const res = await updateBookCopyStatus(editingCopy.id, newStatus);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setStatusOpen(false);
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!deletingCopy) return;
    setLoading(true);
    const res = await deleteBookCopy(deletingCopy.id);
    setLoading(false);

    if (res.error) {
      setError(res.error);
      setDeleteOpen(false);
    } else {
      setDeleteOpen(false);
      router.refresh();
    }
  }

  const columns = [
    {
      key: "copy_number",
      header: "Copy Code",
      cell: (row: CopyRow) => (
        <div className="flex items-center gap-2 font-mono font-bold text-sm">
          <Layers className="h-4 w-4 text-cyan-600 flex-shrink-0" />
          <span>#{row.copy_number}</span>
        </div>
      ),
    },
    {
      key: "book",
      header: "Book Title",
      cell: (row: CopyRow) => (
        <div>
          <Link href={`/library/books/${row.book_id}`} className="font-medium text-primary hover:underline line-clamp-1">
            {row.books?.title ?? "Unknown Book"}
          </Link>
          {row.books?.isbn && <p className="text-[11px] font-mono text-muted-foreground">{row.books.isbn}</p>}
        </div>
      ),
    },
    {
      key: "qr_code",
      header: "QR Token",
      cell: (row: CopyRow) => (
        <span className="font-mono text-xs text-muted-foreground inline-flex items-center gap-1">
          <QrCode className="h-3 w-3" />
          {row.qr_code ?? "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row: CopyRow) => {
        let badgeColor = "border-emerald-200 bg-emerald-50 text-emerald-700";
        if (row.status === "borrowed") badgeColor = "border-blue-200 bg-blue-50 text-blue-700";
        if (row.status === "overdue") badgeColor = "border-rose-200 bg-rose-50 text-rose-700";
        if (row.status === "damaged" || row.status === "lost") badgeColor = "border-amber-200 bg-amber-50 text-amber-700";

        return (
          <Badge variant="outline" className={cn("text-xs capitalize font-medium", badgeColor)}>
            {row.status}
          </Badge>
        );
      },
    },
    ...(isLibrarian
      ? [
          {
            key: "actions",
            header: "",
            cell: (row: CopyRow) => (
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs gap-1"
                  onClick={() => {
                    setEditingCopy(row);
                    setNewStatus(row.status);
                    setStatusOpen(true);
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Status
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50"
                  onClick={() => {
                    setDeletingCopy(row);
                    setDeleteOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      {error && <div className="p-3 text-sm rounded-lg bg-rose-50 text-rose-700 border border-rose-200">{error}</div>}

      {isLibrarian && (
        <div className="flex justify-end">
          <Button onClick={handleOpenAdd} className="gradient-primary text-white border-0" id="add-copy-btn">
            <Plus className="mr-2 h-4 w-4" />
            Add Copy
          </Button>
        </div>
      )}

      <DataTable
        data={(copies ?? []) as any[]}
        columns={columns as never}
        searchable
        searchPlaceholder="Search copies by code, QR token, or book title..."
        pageSize={12}
        emptyTitle="No physical copies catalogued"
        emptyDescription="Add physical book copies to enable loaning and tracking."
        rowKey={(row: any) => row.id}
      />

      {/* Add Copy Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Physical Book Copy</DialogTitle>
            <DialogDescription>Register a new physical copy in the library inventory.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddCopy} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="copy-book">Target Book *</Label>
              <Select value={selectedBookId} onValueChange={(val) => setSelectedBookId(val || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select book..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {books.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="copy-num">Copy Number / Code *</Label>
                <Input
                  id="copy-num"
                  placeholder="e.g. CC-005"
                  value={copyNumber}
                  onChange={(e) => setCopyNumber(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="copy-qr">QR Identifier Token</Label>
                <Input
                  id="copy-qr"
                  placeholder="Optional custom QR token"
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="gradient-primary text-white border-0">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Register Copy"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Copy Status</DialogTitle>
            <DialogDescription>
              Change status for copy <span className="font-mono font-bold">#{editingCopy?.copy_number}</span>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status-select">Physical Status *</Label>
              <Select value={newStatus} onValueChange={(val) => setNewStatus(val || "available")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="borrowed">Borrowed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                  <SelectItem value="maintenance">Under Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStatusOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="gradient-primary text-white border-0">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Status"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Physical Copy"
        description={`Are you sure you want to remove copy #${deletingCopy?.copy_number}?`}
        confirmLabel="Delete"
        variant="destructive"
        loading={loading}
        onConfirm={handleDelete}
      />
    </div>
  );
}
