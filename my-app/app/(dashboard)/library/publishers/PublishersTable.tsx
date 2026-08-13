"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Plus, Pencil, Trash2, Loader2, BookOpen, ExternalLink } from "lucide-react";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { createPublisher, updatePublisher, deletePublisher } from "@/lib/actions/library";

interface Publisher {
  id: string;
  name: string;
  website: string | null;
  bookCount?: number;
}

interface PublishersTableProps {
  publishers: Publisher[];
  isLibrarian: boolean;
}

export function PublishersTable({ publishers, isLibrarian }: PublishersTableProps) {
  const router = useRouter();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPublisher, setEditingPublisher] = useState<Publisher | null>(null);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingPublisher, setDeletingPublisher] = useState<Publisher | null>(null);

  function handleOpenCreate() {
    setEditingPublisher(null);
    setName("");
    setWebsite("");
    setError(null);
    setModalOpen(true);
  }

  function handleOpenEdit(pub: Publisher) {
    setEditingPublisher(pub);
    setName(pub.name);
    setWebsite(pub.website || "");
    setError(null);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    let res;
    if (editingPublisher) {
      res = await updatePublisher(editingPublisher.id, name.trim(), website.trim() || undefined);
    } else {
      res = await createPublisher(name.trim(), website.trim() || undefined);
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
    if (!deletingPublisher) return;
    setLoading(true);
    const res = await deletePublisher(deletingPublisher.id);
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
      header: "Publisher Name",
      cell: (row: Publisher) => (
        <div className="flex items-center gap-2 font-medium">
          <Building2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{row.name}</span>
        </div>
      ),
    },
    {
      key: "website",
      header: "Website",
      cell: (row: Publisher) =>
        row.website ? (
          <a
            href={row.website}
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline text-xs inline-flex items-center gap-1"
          >
            {row.website} <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          "—"
        ),
    },
    {
      key: "books",
      header: "Associated Books",
      cell: (row: Publisher) => (
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
            cell: (row: Publisher) => (
              <div className="flex items-center justify-end gap-1">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleOpenEdit(row)}>
                  <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50"
                  onClick={() => {
                    setDeletingPublisher(row);
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
          <Button onClick={handleOpenCreate} className="gradient-primary text-white border-0" id="add-publisher-btn">
            <Plus className="mr-2 h-4 w-4" />
            Add Publisher
          </Button>
        </div>
      )}

      <DataTable
        data={publishers as any[]}
        columns={columns as never}
        searchable
        searchPlaceholder="Search publishers..."
        searchKeys={["name", "website"] as never}
        pageSize={12}
        emptyTitle="No publishers found"
        emptyDescription="Add book publishing companies."
        rowKey={(row: any) => row.id}
      />

      {/* Add / Edit Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPublisher ? "Edit Publisher" : "Add New Publisher"}</DialogTitle>
            <DialogDescription>Book printing and publishing entity.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pub-name">Publisher Name *</Label>
              <Input
                id="pub-name"
                placeholder="e.g. MIT Press"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pub-website">Website URL</Label>
              <Input
                id="pub-website"
                placeholder="https://mitpress.mit.edu"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="gradient-primary text-white border-0">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : editingPublisher ? "Save Changes" : "Add Publisher"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Publisher"
        description={`Are you sure you want to delete publisher "${deletingPublisher?.name}"?`}
        confirmLabel="Delete"
        variant="destructive"
        loading={loading}
        onConfirm={handleDelete}
      />
    </div>
  );
}
