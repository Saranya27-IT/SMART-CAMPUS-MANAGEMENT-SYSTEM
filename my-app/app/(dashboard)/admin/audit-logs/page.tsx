import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { AdminAuditLogsTable } from "./AdminAuditLogsTable";
import type { Metadata } from "next";
import type { AuditLog } from "@/lib/types/database.types";
import { getCurrentUser } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "Audit Logs — Admin | Smart Campus",
};

export default async function AuditLogsPage() {
  const profile = await getCurrentUser();
  if (!profile || profile.role !== "super_admin") redirect("/dashboard");

  const supabase = await createClient();

  const { data: logs } = await supabase
    .from("audit_logs")
    .select(`*, profiles!audit_logs_actor_id_fkey(full_name, role)`)
    .order("created_at", { ascending: false })
    .limit(200);

  type LogRow = AuditLog & { profiles: { full_name: string; role: string } | null };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description={`Last ${logs?.length ?? 0} system actions.`}
      />
      <AdminAuditLogsTable logs={(logs ?? []) as LogRow[]} />
    </div>
  );
}
