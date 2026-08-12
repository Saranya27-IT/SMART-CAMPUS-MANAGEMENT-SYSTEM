import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth";
import { getStudentAllocations } from "@/lib/actions/bus";
import { PageHeader } from "@/components/common/PageHeader";
import { StudentBusAllocationClient } from "@/components/bus/StudentBusAllocationClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Bus Allocations — Smart Campus",
  description: "Allocate Day Scholar students to campus shuttle buses, routes, and boarding stops.",
};

export default async function BusAllocationsPage() {
  const profile = await getCurrentUser();
  if (!profile || profile.role !== "super_admin") {
    redirect("/dashboard");
  }

  const allocRes = await getStudentAllocations();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Bus Allocations"
        description="Allocate Day Scholar students to active shuttle buses, routes, and stops."
      />
      <StudentBusAllocationClient
        students={allocRes.students || []}
        assignments={allocRes.assignments || []}
        buses={allocRes.buses || []}
        routes={allocRes.routes || []}
      />
    </div>
  );
}
