import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/actions/auth";
import { getHostelFees, getHostels } from "@/lib/actions/hostel";
import { PageHeader } from "@/components/common/PageHeader";
import { HostelFeesClient } from "@/components/hostel/HostelFeesClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hostel Fees — Smart Campus",
  description: "Manage hostel fee structures, track paid balances, and identify overdue accounts.",
};

export default async function HostelFeesPage() {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");

  const isWarden = profile.role === "hostel_warden" || profile.role === "super_admin";
  const isStudent = profile.role === "student";

  const supabase = await createClient();

  const [{ data: fees }, { data: hostelsData }, { data: studentsData }] = await Promise.all([
    getHostelFees(isStudent ? profile.id : undefined),
    getHostels(),
    supabase.from("profiles").select("id, full_name, roll_number, email").eq("role", "student").eq("is_active", true).order("roll_number"),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hostel Accommodation Fees"
        description="Term billing, payment tracking, pending balances, and overdue account identification."
      />
      <HostelFeesClient
        fees={fees || []}
        isWarden={isWarden}
        students={studentsData || []}
        hostels={hostelsData || []}
      />
    </div>
  );
}
