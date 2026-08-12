import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth";
import { getRoutes } from "@/lib/actions/bus";
import { PageHeader } from "@/components/common/PageHeader";
import { RouteManagementClient } from "@/components/bus/RouteManagementClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bus Routes Management — Smart Campus",
  description: "Create and inspect campus bus shuttle routes, starting locations, and destinations.",
};

export default async function BusRoutesPage() {
  const profile = await getCurrentUser();
  if (!profile || profile.role !== "super_admin") {
    redirect("/dashboard");
  }

  const routesRes = await getRoutes();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bus Routes Management"
        description="Organize starting areas, destinations, and active shuttle routes."
      />
      <RouteManagementClient routes={routesRes.data || []} />
    </div>
  );
}
