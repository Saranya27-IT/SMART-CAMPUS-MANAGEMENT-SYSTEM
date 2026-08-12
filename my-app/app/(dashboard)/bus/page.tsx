import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth";
import { getStudentBusOverview } from "@/lib/actions/bus";
import { PageHeader } from "@/components/common/PageHeader";
import { StudentBusClient } from "@/components/bus/StudentBusClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Bus Schedule — Smart Campus",
  description: "View assigned campus shuttle, route details, driver contacts, and stop timings.",
};

export default async function BusIndexPage() {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");

  if (profile.role === "super_admin") {
    redirect("/bus/manage");
  }

  if (profile.role === "bus_driver") {
    redirect("/driver/dashboard");
  }

  const studentType = (profile as any)?.student_type || "HOSTELLER";
  if (profile.role === "student" && studentType === "HOSTELLER") {
    return (
      <div className="space-y-6">
        <PageHeader title="My Bus Access Restricted" description="Campus shuttle transport management." />
        <StudentBusClient
          isAssigned={false}
          busData={null}
          error="Hostel services and Bus services are mutually exclusive. Bus facilities are available ONLY for Day Scholar students."
        />
      </div>
    );
  }

  const busOverview = await getStudentBusOverview();

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Bus & Route Schedule"
        description="Assigned campus shuttle bus number, driver details, and stop sequence arrival times."
      />
      <StudentBusClient
        isAssigned={busOverview.isAssigned || false}
        busData={busOverview.data || null}
        error={busOverview.error}
      />
    </div>
  );
}
