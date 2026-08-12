"use client";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/DataTable";
import { ROLE_LABELS, ROLE_COLORS, type UserRole } from "@/lib/types/roles";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Profile } from "@/lib/types/database.types";

interface AdminUsersTableProps {
  users: Profile[];
}

export function AdminUsersTable({ users }: AdminUsersTableProps) {
  const columns = [
    {
      key: "full_name",
      header: "Name",
      cell: (row: Profile) => (
        <div>
          <p className="font-medium text-sm">{row.full_name}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      cell: (row: Profile) => (
        <Badge variant="outline" className={cn("text-xs", ROLE_COLORS[row.role as UserRole])}>
          {ROLE_LABELS[row.role as UserRole]}
        </Badge>
      ),
    },
    {
      key: "roll_number",
      header: "ID",
      cell: (row: Profile) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.roll_number ?? row.employee_id ?? "—"}
        </span>
      ),
    },
    {
      key: "department",
      header: "Department",
      cell: (row: Profile) => row.department ?? "—",
    },
    {
      key: "is_active",
      header: "Status",
      cell: (row: Profile) => (
        <Badge variant="outline" className={row.is_active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}>
          {row.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Joined",
      cell: (row: Profile) => (
        <span className="text-xs text-muted-foreground">
          {format(new Date(row.created_at), "d MMM yyyy")}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      data={(users ?? []) as any[]}
      columns={columns as never}
      searchable
      searchPlaceholder="Search by name, email, roll number..."
      searchKeys={["full_name", "email", "roll_number"] as never}
      pageSize={20}
      emptyTitle="No users found"
      rowKey={(row: any) => row.id}
    />
  );
}
