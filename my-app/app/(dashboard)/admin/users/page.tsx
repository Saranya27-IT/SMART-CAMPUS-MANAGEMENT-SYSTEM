import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { AdminUsersTable } from "./AdminUsersTable";
import type { Metadata } from "next";
import type { Profile } from "@/lib/types/database.types";
import { getCurrentUser } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "Users — Admin | Smart Campus",
};

export default async function AdminUsersPage() {
  const profile = await getCurrentUser();
  if (!profile || profile.role !== "super_admin") redirect("/dashboard");

  const supabase = await createClient();

  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description={`${users?.length ?? 0} users in the system.`}
      />
      <AdminUsersTable users={(users ?? []) as Profile[]} />
    </div>
  );
}
