"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserCheck, Plus, Pencil, Trash2, Loader2, BookOpen } from "lucide-react";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { createAuthor, updateAuthor, deleteAuthor } from "@/lib/actions/library";

interface Author {
  id: string;
  name: string;
  bio: string | null;
  bookCount?: number;
}

interface AuthorsTableProps {
  authors: Author[];
  isLibrarian: boolean;
}

export function AuthorsTable({ authors, isLibrarian }: AuthorsTableProps) {
  const router = useRouter();

  // Dialog state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Delete state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingAuthor, setDeletingAuthor] = useState<Author | null>(null);

  function handleOpenCreate() {
    setEditingAuthor(null);
    setName("");
    setBio("");
    setError(null);
    setModalOpen(true);
  }

  function handleOpenEdit(author: Author) {
    setEditingAuthor(author);
    setName(author.name);
    setBio(author.bio || "");
    setError(null);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    let res;
    if (editingAuthor) {
      res = await updateAuthor(editingAuthor.id, name.trim(), bio.trim() || undefined);
    } else {
      res = await createAuthor(name.trim(), bio.trim() || undefined);
    }

    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      setModalOpen(false);
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!deletingAuthor) return;
    setLoading(true);
    const res = await deleteAuthor(deletingAuthor.id);
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
      key: "name",
      header: "Author Name",
      cell: (row: Author) => (
        <div className="flex items-center gap-2 font-medium">
          <UserCheck className="h-4 w-4 text-primary flex-shrink-0" />
          <span>{row.name}</span>
        </div>
      ),
    },
    {
      key: "bio",
      header: "Biography",
      cell: (row: Author) => <span className="text-xs text-muted-foreground line-clamp-1">{row.bio || "—"}</span>,
    },
    {
      key: "books",
      header: "Books",
      cell: (row: Author) => (
        <Badge variant="secondary" className="text-xs font-mono">
          <BookOpen className="mr-1 h-3 w-3" />
          {row.bookCount ?? 0} books
        </Badge>
      ),
    },
    ...(isLibrarian
      ? [
          {
            key: "actions",
            header: "",
            cell: (row: Author) => (
              <div className="flex items-center justify-end gap-1">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleOpenEdit(row)}>
                  <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50"
                  onClick={() => {
                    setDeletingAuthor(row);
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
          <Button onClick={handleOpenCreate} className="gradient-primary text-white border-0" id="add-author-btn">
            <Plus className="mr-2 h-4 w-4" />
            Add Author
          </Button>
        </div>
      )}

      <DataTable
        data={authors as any[]}
        columns={columns as never}
        searchable
        searchPlaceholder="Search authors..."
        searchKeys={["name", "bio"] as never}
        pageSize={12}
        emptyTitle="No authors found"
        emptyDescription="Add book authors to organize the library catalogue."
        rowKey={(row: any) => row.id}
      />

      {/* Add / Edit Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAuthor ? "Edit Author" : "Add New Author"}</DialogTitle>
            <DialogDescription>Record author profiles and biographies.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="author-name">Author Name *</Label>
              <Input
                id="author-name"
                placeholder="e.g. Donald E. Knuth"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author-bio">Biography</Label>
              <textarea
                id="author-bio"
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Brief author bio or credentials..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="gradient-primary text-white border-0">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : editingAuthor ? "Save Changes" : "Add Author"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Author"
        description={`Are you sure you want to delete author "${deletingAuthor?.name}"?`}
        confirmLabel="Delete"
        variant="destructive"
        loading={loading}
        onConfirm={handleDelete}
      />
    </div>
  );
}
