"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Plus, LayoutGrid, List, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/DataTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type BookRow = {
  id: string;
  title: string;
  isbn: string | null;
  total_copies: number;
  available_copies: number;
  publication_year: number | null;
  cover_url: string | null;
  location_shelf: string | null;
  book_categories: { id?: string; name: string } | null;
  book_authors: { id?: string; name: string } | null;
  book_publishers: { id?: string; name: string } | null;
};

interface BooksTableProps {
  books: BookRow[];
  categories: { id: string; name: string }[];
  authors: { id: string; name: string }[];
  isLibrarian: boolean;
}

export function BooksTable({ books, categories, authors, isLibrarian }: BooksTableProps) {
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAuthor, setSelectedAuthor] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  const filteredBooks = books.filter((book) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = book.title.toLowerCase().includes(q);
      const matchIsbn = book.isbn?.toLowerCase().includes(q);
      const matchAuthor = book.book_authors?.name.toLowerCase().includes(q);
      if (!matchTitle && !matchIsbn && !matchAuthor) return false;
    }

    if (selectedCategory !== "all" && book.book_categories?.id !== selectedCategory && book.book_categories?.name !== selectedCategory) {
      return false;
    }

    if (selectedAuthor !== "all" && book.book_authors?.id !== selectedAuthor && book.book_authors?.name !== selectedAuthor) {
      return false;
    }

    if (availabilityFilter === "available" && book.available_copies <= 0) {
      return false;
    }

    return true;
  });

  const columns = [
    {
      key: "title",
      header: "Title",
      cell: (row: BookRow) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-8 rounded bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden border">
            {row.cover_url ? (
              <img src={row.cover_url} alt={row.title} className="h-full w-full object-cover" />
            ) : (
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div>
            <Link href={`/library/books/${row.id}`} className="font-medium text-primary hover:underline block truncate max-w-[220px]">
              {row.title}
            </Link>
            {row.publication_year && <p className="text-xs text-muted-foreground">{row.publication_year}</p>}
          </div>
        </div>
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
      cell: (row: BookRow) =>
        row.book_categories?.name ? (
          <Badge variant="outline" className="text-xs">
            {row.book_categories.name}
          </Badge>
        ) : (
          "—"
        ),
    },
    {
      key: "isbn",
      header: "ISBN",
      cell: (row: BookRow) => <span className="font-mono text-xs text-muted-foreground">{row.isbn ?? "—"}</span>,
    },
    {
      key: "available",
      header: "Copies Available",
      cell: (row: BookRow) => (
        <span className={cn("font-semibold tabular-nums text-xs px-2 py-1 rounded-full border", row.available_copies === 0 ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-emerald-50 text-emerald-700 border-emerald-200")}>
          {row.available_copies} / {row.total_copies}
        </span>
      ),
    },
    {
      key: "shelf",
      header: "Location",
      cell: (row: BookRow) => <span className="text-xs text-muted-foreground">{row.location_shelf || "Main Shelf"}</span>,
    },
    {
      key: "actions",
      header: "",
      cell: (row: BookRow) => (
        <Link href={`/library/books/${row.id}`}>
          <Button variant="outline" size="sm" className="text-xs">
            Details
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-card p-4 rounded-xl border">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search by title, ISBN, author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
          <Select value={selectedCategory} onValueChange={(val) => setSelectedCategory(val || "all")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={availabilityFilter} onValueChange={(val) => setAvailabilityFilter(val || "all")}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Books</SelectItem>
              <SelectItem value="available">Available Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 border rounded-lg p-1 bg-muted/40 self-end md:self-auto">
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 px-2"
            onClick={() => setViewMode("table")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 px-2"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Grid or Table display */}
      {viewMode === "table" ? (
        <DataTable
          data={filteredBooks}
          columns={columns as never}
          pageSize={12}
          emptyTitle="No books match criteria"
          emptyDescription="Try clearing search filters or search for a different book title."
          rowKey={(row: BookRow) => row.id}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredBooks.map((book) => (
            <Card key={book.id} className="overflow-hidden flex flex-col hover:border-primary/50 transition-colors">
              <div className="h-40 bg-muted flex items-center justify-center relative overflow-hidden border-b">
                {book.cover_url ? (
                  <img src={book.cover_url} alt={book.title} className="h-full w-full object-cover" />
                ) : (
                  <BookOpen className="h-12 w-12 text-muted-foreground/40" />
                )}
                <Badge
                  className={cn(
                    "absolute top-2 right-2 border text-xs",
                    book.available_copies > 0 ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                  )}
                >
                  {book.available_copies > 0 ? `${book.available_copies} Available` : "Out of Stock"}
                </Badge>
              </div>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-semibold line-clamp-1">{book.title}</CardTitle>
                <p className="text-xs text-muted-foreground truncate">{book.book_authors?.name || "Unknown Author"}</p>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-xs space-y-1 flex-1">
                {book.book_categories && (
                  <Badge variant="outline" className="text-[10px] py-0">
                    {book.book_categories.name}
                  </Badge>
                )}
                <p className="text-muted-foreground font-mono">ISBN: {book.isbn || "—"}</p>
              </CardContent>
              <CardFooter className="p-4 pt-2 border-t flex justify-between items-center bg-muted/20">
                <span className="text-xs text-muted-foreground font-medium">
                  {book.available_copies}/{book.total_copies} Copies
                </span>
                <Link href={`/library/books/${book.id}`}>
                  <Button size="sm" variant="outline" className="text-xs">
                    View
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
