"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { EmptyState } from "@/components/common/EmptyState";

export type Column<T> = {
  key: keyof T | string;
  header: string;
  cell?: (row: T) => React.ReactNode;
  className?: string;
};

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  actions?: React.ReactNode;
  className?: string;
  rowKey?: (row: T) => string;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  loading = false,
  searchable = true,
  searchPlaceholder = "Search...",
  searchKeys = [],
  pageSize = 10,
  emptyTitle = "No data found",
  emptyDescription = "There are no items to display.",
  actions,
  className,
  rowKey,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  // Filter
  const filtered =
    debouncedSearch && searchKeys.length > 0
      ? data.filter((row) =>
          searchKeys.some((key) => {
            const val = row[key];
            return String(val ?? "")
              .toLowerCase()
              .includes(debouncedSearch.toLowerCase());
          })
        )
      : data;

  // Paginate
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  function getCell(row: T, col: Column<T>) {
    if (col.cell) return col.cell(row);
    const val = row[col.key as keyof T];
    return val != null ? String(val) : "—";
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      {(searchable || actions) && (
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          {searchable && (
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 pr-9"
                id="datatable-search"
              />
              {search && (
                <button
                  onClick={() => { setSearch(""); setPage(1); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              {columns.map((col) => (
                <TableHead
                  key={String(col.key)}
                  className={cn("font-semibold text-xs uppercase tracking-wide", col.className)}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={String(col.key)}>
                      <Skeleton className="h-4 w-full max-w-[120px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-12">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    compact
                  />
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((row, idx) => (
                <TableRow
                  key={rowKey ? rowKey(row) : idx}
                  className="hover:bg-muted/30 transition-colors"
                >
                  {columns.map((col) => (
                    <TableCell key={String(col.key)} className={col.className}>
                      {getCell(row, col)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!loading && filtered.length > pageSize && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {(safePage - 1) * pageSize + 1}–
            {Math.min(safePage * pageSize, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              id="table-prev-btn"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2">
              {safePage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              id="table-next-btn"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
