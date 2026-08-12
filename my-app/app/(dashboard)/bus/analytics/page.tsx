import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth";
import { getBusDashboardStats } from "@/lib/actions/bus";
import { PageHeader } from "@/components/common/PageHeader";
import { BusAnalyticsClient } from "@/components/bus/BusAnalyticsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bus Analytics & CSV Data Export — Smart Campus",
  description: "Transport fleet capacity metrics, active routes, breakdown stats, and CSV data export.",
};

export default async function BusAnalyticsPage() {
  const profile = await getCurrentUser();
  if (!profile || profile.role !== "super_admin") {
    redirect("/dashboard");
  }

  const statsRes = await getBusDashboardStats();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bus Transport Analytics & Data Export"
        description="Shuttle capacity utilization, route metrics, breakdown alerts, and CSV exports."
      />
      <BusAnalyticsClient stats={statsRes} />
    </div>
  );
}
