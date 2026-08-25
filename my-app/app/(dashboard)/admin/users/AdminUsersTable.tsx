"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/DataTable";
import { ROLE_LABELS, ROLE_COLORS, type UserRole } from "@/lib/types/roles";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Profile } from "@/lib/types/database.types";
import { AdminUserModal } from "./AdminUserModal";
import { Plus, Edit2, Power, UserCheck, ShieldAlert, Users } from "lucide-react";
import { toggleUserStatusByAdmin } from "@/lib/actions/auth";
import { toast } from "sonner";

interface AdminUsersTableProps {
  users: Profile[];
}

export function AdminUsersTable({ users }: AdminUsersTableProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function handleToggleStatus(user: Profile) {
    setTogglingId(user.id);
    const res = await toggleUserStatusByAdmin(user.id, user.is_active);
    setTogglingId(null);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`User ${user.full_name} is now ${res.is_active ? "Active" : "Inactive"}.`);
    }
  }

  const columns = [
    {
      key: "full_name",
      header: "User Identity",
      cell: (row: Profile) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
            {row.full_name?.charAt(0) || "U"}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-foreground truncate">{row.full_name}</p>
            <p className="text-xs text-muted-foreground font-mono truncate">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role / Permissions",
      cell: (row: Profile) => (
        <div className="space-y-1">
          <Badge className={cn("text-xs font-semibold uppercase tracking-wider border", ROLE_COLORS[row.role as UserRole])}>
            {ROLE_LABELS[row.role as UserRole]}
          </Badge>
          {row.role === "student" && (
            <p className="text-[11px] text-muted-foreground font-medium">
              {(row as any).student_type === "DAY_SCHOLAR" ? "🚌 Day Scholar" : "🏠 Hosteller"}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "roll_number",
      header: "Institutional ID",
      cell: (row: Profile) => (
        <span className="font-mono text-xs text-muted-foreground font-semibold">
          {row.roll_number ?? row.employee_id ?? "—"}
        </span>
      ),
    },
    {
      key: "department",
      header: "Department",
      cell: (row: Profile) => (
        <span className="text-xs font-medium text-foreground">{row.department ?? "—"}</span>
      ),
    },
    {
      key: "is_active",
      header: "Account State",
      cell: (row: Profile) => (
        <Badge
          className={cn(
            "text-xs font-semibold border",
            row.is_active
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
          )}
        >
          {row.is_active ? "● Active" : "○ Inactive"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Created Date",
      cell: (row: Profile) => (
        <span className="text-xs text-muted-foreground font-mono">
          {format(new Date(row.created_at), "d MMM yyyy")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Row Actions",
      cell: (row: Profile) => (
        <div className="flex items-center gap-1.5 justify-end">
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-2.5 text-xs gap-1 rounded-lg border-blue-200 hover:bg-blue-50 dark:border-blue-800"
            onClick={() => {
              setSelectedUser(row);
              setModalOpen(true);
            }}
          >
            <Edit2 className="h-3 w-3 text-blue-600" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={togglingId === row.id}
            className={cn(
              "h-8 px-2 text-xs rounded-lg",
              row.is_active ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30" : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
            )}
            onClick={() => handleToggleStatus(row)}
            title={row.is_active ? "Deactivate User" : "Activate User"}
          >
            <Power className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="w-4 h-4 text-blue-600" />
          <span>Total registered accounts: <strong>{users.length}</strong></span>
        </div>
        <Button
          onClick={() => {
            setSelectedUser(null);
            setModalOpen(true);
          }}
          className="gradient-admin text-white border-0 gap-1.5 shadow-md font-semibold text-xs rounded-xl"
          id="create-new-user-btn"
        >
          <Plus className="h-4 w-4" />
          Create New User
        </Button>
      </div>

      <DataTable
        data={(users ?? []) as any[]}
        columns={columns as never}
        searchable
        searchPlaceholder="Search by name, email, roll number, department..."
        searchKeys={["full_name", "email", "roll_number", "department"] as never}
        pageSize={20}
        emptyTitle="No users found"
        rowKey={(row: any) => row.id}
      />

      <AdminUserModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        userToEdit={selectedUser}
      />
    </div>
  );
}
