"use client";

import { BookOpen } from "lucide-react";
import { DataTable } from "@/components/common/DataTable";

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface CategoriesTableProps {
  categories: Category[];
}

export function CategoriesTable({ categories }: CategoriesTableProps) {
  const columns = [
    {
      key: "name",
      header: "Category Name",
      cell: (row: Category) => (
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="font-semibold">{row.name}</span>
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      cell: (row: Category) => row.description || "—",
    },
  ];

  return (
    <DataTable
      data={categories as any[]}
      columns={columns as never}
      searchable
      searchPlaceholder="Search categories..."
      searchKeys={["name"] as never}
      pageSize={15}
      emptyTitle="No categories found"
      rowKey={(row: any) => row.id}
    />
  );
}
