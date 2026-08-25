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
import { Plus, Edit2, Power, UserCheck, ShieldAlert } from "lucide-react";
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
      header: "Name",
      cell: (row: Profile) => (
        <div>
          <p className="font-semibold text-sm text-foreground">{row.full_name}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      cell: (row: Profile) => (
        <div className="space-y-1">
          <Badge variant="outline" className={cn("text-xs font-semibold", ROLE_COLORS[row.role as UserRole])}>
            {ROLE_LABELS[row.role as UserRole]}
          </Badge>
          {row.role === "student" && (
            <p className="text-[11px] text-muted-foreground">
              {(row as any).student_type === "DAY_SCHOLAR" ? "🚌 Day Scholar" : "🏠 Hosteller"}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "roll_number",
      header: "ID",
      cell: (row: Profile) => (
        <span className="font-mono text-xs text-muted-foreground font-medium">
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
      header: "Status",
      cell: (row: Profile) => (
        <Badge
          variant="outline"
          className={
            row.is_active
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 font-medium"
              : "border-rose-200 bg-rose-50 text-rose-700 font-medium"
          }
        >
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
    {
      key: "actions",
      header: "Actions",
      cell: (row: Profile) => (
        <div className="flex items-center gap-1.5 justify-end">
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-2.5 text-xs gap-1"
            onClick={() => {
              setSelectedUser(row);
              setModalOpen(true);
            }}
          >
            <Edit2 className="h-3 w-3" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={togglingId === row.id}
            className={cn(
              "h-8 px-2 text-xs",
              row.is_active ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50" : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
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
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setSelectedUser(null);
            setModalOpen(true);
          }}
          className="gradient-primary text-white border-0 gap-2 shadow-sm"
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
