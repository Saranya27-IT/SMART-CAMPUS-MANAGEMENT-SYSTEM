import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth";
import { getDriverAssignedBus } from "@/lib/actions/bus";
import { PageHeader } from "@/components/common/PageHeader";
import { DriverDashboardClient } from "@/components/bus/DriverDashboardClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Driver Dashboard — Smart Campus",
  description: "Manage assigned shuttle bus, update trip statuses, and report breakdown complaints.",
};

export default async function DriverDashboardPage() {
  const profile = await getCurrentUser();
  if (!profile || (profile.role !== "bus_driver" && profile.role !== "super_admin")) {
    redirect("/dashboard");
  }

  const driverData = await getDriverAssignedBus();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bus Driver Dashboard"
        description="Assigned vehicle overview, trip status controls, and breakdown complaint system."
      />
      <DriverDashboardClient
        bus={driverData.bus || null}
        route={driverData.route || null}
        stops={driverData.stops || []}
        activeTrip={driverData.activeTrip || null}
      />
    </div>
  );
}
