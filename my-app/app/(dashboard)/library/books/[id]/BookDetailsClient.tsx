"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, BookOpen, Building2, Calendar, CheckCircle2,
  Copy, Hash, Layers, QrCode, Trash2, UserCheck, AlertCircle, Loader2, BookmarkPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { deleteBook, reserveBook } from "@/lib/actions/library";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface BookDetailsProps {
  book: any;
  isLibrarian: boolean;
}

export function BookDetailsClient({ book, isLibrarian }: BookDetailsProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    const res = await deleteBook(book.id);
    if (res.error) {
      setError(res.error);
      setDeleting(false);
      setDeleteOpen(false);
    } else {
      router.push("/library/books");
      router.refresh();
    }
  }

  async function handleReserve() {
    setReserving(true);
    const res = await reserveBook(book.id);
    setReserving(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.message || `Hold placed successfully for "${book.title}".`);
    }
  }

  const copies = (book.book_copies ?? []) as any[];

  return (
    <div className="space-y-6 max-w-4xl">
      {error && (
        <div className="p-4 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-sm">
          {error}
        </div>
      )}

      {/* Overview Card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {book.book_categories?.name ?? "General"}
              </Badge>
              {book.isbn && (
                <span className="text-xs font-mono text-muted-foreground">
                  ISBN: {book.isbn}
                </span>
              )}
            </div>
            <CardTitle className="text-2xl font-bold">{book.title}</CardTitle>
            <CardDescription className="text-sm">
              By {book.book_authors?.name ?? "Unknown Author"}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {!isLibrarian && (
              <Button
                variant={book.available_copies === 0 ? "default" : "outline"}
                size="sm"
                disabled={reserving}
                className={book.available_copies === 0 ? "gradient-primary text-white border-0 gap-1.5 text-xs" : "gap-1.5 text-xs"}
                onClick={handleReserve}
              >
                <BookmarkPlus className="h-4 w-4" />
                {reserving ? "Placing Hold..." : book.available_copies === 0 ? "Reserve / Place Hold" : "Reserve Copy"}
              </Button>
            )}

            {isLibrarian && (
              <Button
                variant="outline"
                size="sm"
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Book
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {book.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {book.description}
            </p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-muted/50 border text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Publisher</p>
              <p className="font-medium mt-0.5">{book.book_publishers?.name ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Publication Year</p>
              <p className="font-medium mt-0.5">{book.publication_year ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Edition</p>
              <p className="font-medium mt-0.5">{book.edition ?? "1st Edition"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Location / Shelf</p>
              <p className="font-medium mt-0.5">{book.location_shelf ?? "—"}</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-card border">
            <div>
              <span className="text-xs text-muted-foreground block font-medium">Available Copies Status</span>
              <span className={cn("text-2xl font-bold tabular-nums", book.available_copies > 0 ? "text-emerald-600" : "text-rose-600")}>
                {book.available_copies} / {book.total_copies} available
              </span>
            </div>
            {book.available_copies === 0 && (
              <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 text-xs">
                All copies currently in circulation
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Book Copies Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Copy className="h-5 w-5 text-primary" />
            Book Copies ({copies.length})
          </CardTitle>
          <CardDescription>
            Individual physical copies and barcode/QR codes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {copies.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No copies registered.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {copies.map((copy) => (
                <div
                  key={copy.id}
                  className="p-3 rounded-lg border bg-card flex items-center justify-between gap-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-xs font-mono">Copy #{copy.copy_number}</p>
                    <p className="text-xs text-muted-foreground truncate font-mono mt-0.5">
                      QR: {copy.qr_code}
                    </p>
                  </div>
                  <Badge
                    variant={copy.status === "available" ? "outline" : "secondary"}
                    className={cn(
                      "text-xs capitalize flex-shrink-0",
                      copy.status === "available"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    )}
                  >
                    {copy.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Book"
        description={`Are you sure you want to delete "${book.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
