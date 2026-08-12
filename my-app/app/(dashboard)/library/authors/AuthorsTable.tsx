"use client";

import { UserCheck } from "lucide-react";
import { DataTable } from "@/components/common/DataTable";

interface Author {
  id: string;
  name: string;
  bio: string | null;
}

interface AuthorsTableProps {
  authors: Author[];
}

export function AuthorsTable({ authors }: AuthorsTableProps) {
  const columns = [
    {
      key: "name",
      header: "Author Name",
      cell: (row: Author) => (
        <div className="flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-primary" />
          <span className="font-semibold">{row.name}</span>
        </div>
      ),
    },
    {
      key: "bio",
      header: "Biography",
      cell: (row: Author) => row.bio || "—",
    },
  ];

  return (
    <DataTable
      data={authors as any[]}
      columns={columns as never}
      searchable
      searchPlaceholder="Search authors..."
      searchKeys={["name"] as never}
      pageSize={15}
      emptyTitle="No authors recorded"
      rowKey={(row: any) => row.id}
    />
  );
}
