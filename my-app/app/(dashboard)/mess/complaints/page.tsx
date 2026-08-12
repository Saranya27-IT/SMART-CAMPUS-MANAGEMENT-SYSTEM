import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth";
import { getMessComplaints } from "@/lib/actions/mess";
import { PageHeader } from "@/components/common/PageHeader";
import { MessComplaintsClient } from "@/components/mess/MessComplaintsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Food Complaints — Mess Management",
  description: "Track and resolve student food quality and dining complaints.",
};

export default async function MessComplaintsPage() {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");

  const isManager = profile.role === "mess_manager" || profile.role === "super_admin";
  const { data: complaints } = await getMessComplaints();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mess Food & Service Complaints"
        description="Track, investigate, update status, and resolve student catering complaints."
      />
      <MessComplaintsClient
        complaints={complaints || []}
        isManager={isManager}
      />
    </div>
  );
}
