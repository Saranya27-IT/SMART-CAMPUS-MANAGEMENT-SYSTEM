"use client";

import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/DataTable";
import { cn } from "@/lib/utils";

type BookRow = {
  id: string;
  title: string;
  isbn: string | null;
  total_copies: number;
  available_copies: number;
  book_categories: { name: string } | null;
  book_authors: { name: string } | null;
};

interface BooksTableProps {
  books: BookRow[];
  isLibrarian: boolean;
}

export function BooksTable({ books, isLibrarian }: BooksTableProps) {
  const columns = [
    {
      key: "title",
      header: "Title",
      cell: (row: BookRow) => (
        <Link href={`/library/books/${row.id}`} className="font-medium text-primary hover:underline flex items-center gap-2">
          <BookOpen className="h-4 w-4 flex-shrink-0" />
          <span className="truncate max-w-[200px]">{row.title}</span>
        </Link>
      ),
    },
    {
      key: "author",
      header: "Author",
      cell: (row: BookRow) => row.book_authors?.name ?? "—",
    },
    {
      key: "category",
      header: "Category",
      cell: (row: BookRow) => row.book_categories?.name
        ? <Badge variant="outline" className="text-xs">{row.book_categories.name}</Badge>
        : "—",
    },
    {
      key: "isbn",
      header: "ISBN",
      cell: (row: BookRow) => <span className="font-mono text-xs text-muted-foreground">{row.isbn ?? "—"}</span>,
    },
    {
      key: "available",
      header: "Available",
      cell: (row: BookRow) => (
        <span className={cn("font-medium tabular-nums", row.available_copies === 0 ? "text-rose-600" : "text-emerald-600")}>
          {row.available_copies} / {row.total_copies}
        </span>
      ),
    },
    ...(isLibrarian ? [{
      key: "actions",
      header: "",
      cell: (row: BookRow) => (
        <Link href={`/library/books/${row.id}`}>
          <Button variant="ghost" size="sm">View</Button>
        </Link>
      ),
    }] : []),
  ];

  return (
    <DataTable
      data={books}
      columns={columns as never}
      searchable
      searchPlaceholder="Search by title, author..."
      searchKeys={["title", "isbn"] as never}
      pageSize={15}
      emptyTitle="No books found"
      emptyDescription="The library catalogue is empty. Add books to get started."
      rowKey={(row: BookRow) => row.id}
    />
  );
}
