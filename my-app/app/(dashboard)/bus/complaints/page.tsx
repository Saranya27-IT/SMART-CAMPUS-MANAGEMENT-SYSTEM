import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth";
import { getBusComplaints } from "@/lib/actions/bus";
import { PageHeader } from "@/components/common/PageHeader";
import { BusComplaintsClient } from "@/components/bus/BusComplaintsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bus Complaints & Maintenance — Smart Campus",
  description: "Driver breakdown complaints, engine maintenance alerts, and admin resolution tracking.",
};

export default async function BusComplaintsPage() {
  const profile = await getCurrentUser();
  if (!profile || (profile.role !== "super_admin" && profile.role !== "bus_driver")) {
    redirect("/dashboard");
  }

  const isSuperAdmin = profile.role === "super_admin";
  const complaintsRes = await getBusComplaints();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bus Breakdown & Maintenance Complaints"
        description="Driver vehicle breakdown reports, engine alerts, and administration resolution notes."
      />
      <BusComplaintsClient complaints={complaintsRes.data || []} isSuperAdmin={isSuperAdmin} />
    </div>
  );
}
