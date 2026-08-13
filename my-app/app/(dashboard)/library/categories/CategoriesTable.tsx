"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderTree, Plus, Pencil, Trash2, Loader2, BookOpen } from "lucide-react";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { createCategory, updateCategory, deleteCategory } from "@/lib/actions/library";

interface Category {
  id: string;
  name: string;
  description: string | null;
  bookCount?: number;
}

interface CategoriesTableProps {
  categories: Category[];
  isLibrarian: boolean;
}

export function CategoriesTable({ categories, isLibrarian }: CategoriesTableProps) {
  const router = useRouter();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  function handleOpenCreate() {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setError(null);
    setModalOpen(true);
  }

  function handleOpenEdit(cat: Category) {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || "");
    setError(null);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    let res;
    if (editingCategory) {
      res = await updateCategory(editingCategory.id, name.trim(), description.trim() || undefined);
    } else {
      res = await createCategory(name.trim(), description.trim() || undefined);
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
    if (!deletingCategory) return;
    setLoading(true);
    const res = await deleteCategory(deletingCategory.id);
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
      header: "Category Name",
      cell: (row: Category) => (
        <div className="flex items-center gap-2 font-medium">
          <FolderTree className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <span>{row.name}</span>
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      cell: (row: Category) => <span className="text-xs text-muted-foreground line-clamp-1">{row.description || "—"}</span>,
    },
    {
      key: "books",
      header: "Books",
      cell: (row: Category) => (
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
            cell: (row: Category) => (
              <div className="flex items-center justify-end gap-1">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleOpenEdit(row)}>
                  <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50"
                  onClick={() => {
                    setDeletingCategory(row);
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
          <Button onClick={handleOpenCreate} className="gradient-primary text-white border-0" id="add-category-btn">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
      )}

      <DataTable
        data={categories as any[]}
        columns={columns as never}
        searchable
        searchPlaceholder="Search categories..."
        searchKeys={["name", "description"] as never}
        pageSize={12}
        emptyTitle="No categories found"
        emptyDescription="Create book categories to organize books."
        rowKey={(row: any) => row.id}
      />

      {/* Add / Edit Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
            <DialogDescription>Classification category for library books.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Category Name *</Label>
              <Input
                id="cat-name"
                placeholder="e.g. Computer Science"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-desc">Description</Label>
              <textarea
                id="cat-desc"
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Brief category scope..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="gradient-primary text-white border-0">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : editingCategory ? "Save Changes" : "Add Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Category"
        description={`Are you sure you want to delete category "${deletingCategory?.name}"?`}
        confirmLabel="Delete"
        variant="destructive"
        loading={loading}
        onConfirm={handleDelete}
      />
    </div>
  );
}
