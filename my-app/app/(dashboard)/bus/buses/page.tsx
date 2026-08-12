import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth";
import { getBuses, getRoutes, getBusDashboardStats } from "@/lib/actions/bus";
import { PageHeader } from "@/components/common/PageHeader";
import { BusManagementClient } from "@/components/bus/BusManagementClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bus Fleet Management — Smart Campus",
  description: "Create, inspect, update status, and allocate drivers to campus buses.",
};

export default async function BusListPage() {
  const profile = await getCurrentUser();
  if (!profile || profile.role !== "super_admin") {
    redirect("/dashboard");
  }

  const [busesRes, routesRes, statsRes] = await Promise.all([
    getBuses(),
    getRoutes(),
    getBusDashboardStats(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bus Fleet Management"
        description="Register buses, update capacity & status, and allocate drivers & routes."
      />
      <BusManagementClient
        buses={busesRes.data || []}
        routes={routesRes.data || []}
        drivers={statsRes.rawDrivers || []}
      />
    </div>
  );
}
