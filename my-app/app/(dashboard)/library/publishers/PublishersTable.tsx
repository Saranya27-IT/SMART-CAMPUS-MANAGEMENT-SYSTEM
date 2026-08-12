"use client";

import { Building2 } from "lucide-react";
import { DataTable } from "@/components/common/DataTable";

interface Publisher {
  id: string;
  name: string;
  website: string | null;
}

interface PublishersTableProps {
  publishers: Publisher[];
}

export function PublishersTable({ publishers }: PublishersTableProps) {
  const columns = [
    {
      key: "name",
      header: "Publisher Name",
      cell: (row: Publisher) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          <span className="font-semibold">{row.name}</span>
        </div>
      ),
    },
    {
      key: "website",
      header: "Website",
      cell: (row: Publisher) => (
        row.website ? (
          <a href={row.website} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs">
            {row.website}
          </a>
        ) : "—"
      ),
    },
  ];

  return (
    <DataTable
      data={publishers as any[]}
      columns={columns as never}
      searchable
      searchPlaceholder="Search publishers..."
      searchKeys={["name"] as never}
      pageSize={15}
      emptyTitle="No publishers recorded"
      rowKey={(row: any) => row.id}
    />
  );
}
