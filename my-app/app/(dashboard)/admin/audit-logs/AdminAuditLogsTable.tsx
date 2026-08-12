"use client";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/DataTable";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { AuditLog } from "@/lib/types/database.types";

const ACTION_COLORS: Record<string, string> = {
  CREATE: "border-emerald-200 bg-emerald-50 text-emerald-700",
  UPDATE: "border-amber-200 bg-amber-50 text-amber-700",
  DELETE: "border-rose-200 bg-rose-50 text-rose-700",
  BORROW: "border-indigo-200 bg-indigo-50 text-indigo-700",
  RETURN: "border-cyan-200 bg-cyan-50 text-cyan-700",
};

function getActionColor(action: string): string {
  const key = Object.keys(ACTION_COLORS).find(k => action.startsWith(k));
  return key ? ACTION_COLORS[key] : "border-gray-200 bg-gray-50 text-gray-600";
}

type LogRow = AuditLog & { profiles: { full_name: string; role: string } | null };

interface AdminAuditLogsTableProps {
  logs: LogRow[];
}

export function AdminAuditLogsTable({ logs }: AdminAuditLogsTableProps) {
  const columns = [
    {
      key: "created_at",
      header: "Time",
      cell: (row: LogRow) => (
        <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
          {format(new Date(row.created_at), "d MMM HH:mm:ss")}
        </span>
      ),
    },
    {
      key: "actor",
      header: "Actor",
      cell: (row: LogRow) => (
        <span className="text-sm">{row.profiles?.full_name ?? "System"}</span>
      ),
    },
    {
      key: "action",
      header: "Action",
      cell: (row: LogRow) => (
        <Badge variant="outline" className={cn("text-xs font-mono", getActionColor(row.action))}>
          {row.action}
        </Badge>
      ),
    },
    {
      key: "entity_type",
      header: "Entity",
      cell: (row: LogRow) => (
        <span className="text-xs font-mono text-muted-foreground">{row.entity_type}</span>
      ),
    },
    {
      key: "metadata",
      header: "Details",
      cell: (row: LogRow) => (
        <span className="text-xs text-muted-foreground font-mono">
          {row.metadata ? JSON.stringify(row.metadata).slice(0, 60) + "..." : "—"}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      data={(logs ?? []) as any[]}
      columns={columns as never}
      searchable
      searchPlaceholder="Search by action or entity..."
      searchKeys={["action", "entity_type"] as never}
      pageSize={20}
      emptyTitle="No audit logs"
      rowKey={(row: any) => row.id}
    />
  );
}
