import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/actions/auth";
import { getHostels } from "@/lib/actions/hostel";
import { PageHeader } from "@/components/common/PageHeader";
import { RoomWiseAttendanceClient } from "@/components/hostel/RoomWiseAttendanceClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hostel Attendance — Smart Campus",
  description: "Room-wise night roll call attendance marking and record history.",
};

export default async function HostelAttendancePage() {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");

  const isWarden = profile.role === "hostel_warden" || profile.role === "super_admin";
  if (!isWarden) redirect("/hostel");

  const supabase = await createClient();

  const [hostelsResult, { data: bedsData }, { data: historyData }] = await Promise.all([
    getHostels(),
    supabase.from("hostel_beds").select(`
      id, bed_number, student_id, status,
      profiles!hostel_beds_student_id_fkey(id, full_name, roll_number, department),
      hostel_rooms(
        id, room_number,
        hostel_floors(
          floor_number,
          hostel_blocks(
            name,
            hostels(id, name)
          )
        )
      )
    `).eq("status", "occupied"),
    supabase.from("hostel_attendance").select(`*, profiles!hostel_attendance_student_id_fkey(full_name, roll_number)`).order("date", { ascending: false }).limit(100),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hostel Night Roll Call Attendance"
        description="Select Hostel and Room to mark student roll call attendance with instant duplicate prevention."
      />
      <RoomWiseAttendanceClient
        hostels={hostelsResult.data || []}
        allBeds={bedsData || []}
        historicalAttendance={historyData || []}
      />
    </div>
  );
}
