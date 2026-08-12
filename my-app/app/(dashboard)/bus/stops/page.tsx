import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth";
import { getStops, getRoutes } from "@/lib/actions/bus";
import { PageHeader } from "@/components/common/PageHeader";
import { StopManagementClient } from "@/components/bus/StopManagementClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bus Stops Management — Smart Campus",
  description: "Configure sequence ordering, arrival times, and boarding landmarks for campus shuttle routes.",
};

export default async function BusStopsPage() {
  const profile = await getCurrentUser();
  if (!profile || profile.role !== "super_admin") {
    redirect("/dashboard");
  }

  const [stopsRes, routesRes] = await Promise.all([
    getStops(),
    getRoutes(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bus Stops Management"
        description="Organize sequence order, arrival & departure times, and boarding landmarks."
      />
      <StopManagementClient stops={stopsRes.data || []} routes={routesRes.data || []} />
    </div>
  );
}
