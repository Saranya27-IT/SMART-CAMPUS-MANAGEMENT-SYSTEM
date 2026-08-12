import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/actions/auth";
import { getHostelStudentsList, getHostelFees, getLeaveRequests, getHostelComplaints } from "@/lib/actions/hostel";
import { PageHeader } from "@/components/common/PageHeader";
import { HostelAnalyticsClient } from "@/components/hostel/HostelAnalyticsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hostel Analytics & Export — Smart Campus",
  description: "View analytics metrics and export hostel datasets in CSV/Excel format.",
};

export default async function HostelAnalyticsPage() {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");

  const isWarden = profile.role === "hostel_warden" || profile.role === "super_admin";
  if (!isWarden) redirect("/hostel");

  const supabase = await createClient();

  const [
    studentsRes,
    feesRes,
    leavesRes,
    complaintsRes,
    { data: allocData },
    { data: attData },
  ] = await Promise.all([
    getHostelStudentsList(),
    getHostelFees(),
    getLeaveRequests(),
    getHostelComplaints(),
    supabase.from("hostel_beds").select(`*, hostel_rooms(room_number, hostel_floors(floor_number, hostel_blocks(name, hostels(name)))), profiles!hostel_beds_student_id_fkey(full_name, roll_number)`).eq("status", "occupied"),
    supabase.from("hostel_attendance").select(`*, profiles!hostel_attendance_student_id_fkey(full_name, roll_number)`).order("date", { ascending: false }).limit(200),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hostel Analytics & Data Export"
        description="Inspect operational reports, room occupancy distributions, and export hostel datasets to CSV/Excel format."
      />
      <HostelAnalyticsClient
        studentsData={studentsRes.data || []}
        allocationsData={allocData || []}
        feesData={feesRes.data || []}
        leavesData={leavesRes.data || []}
        complaintsData={complaintsRes.data || []}
        attendanceData={attData || []}
      />
    </div>
  );
}
