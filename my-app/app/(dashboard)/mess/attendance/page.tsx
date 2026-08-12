import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth";
import { getMessAttendance } from "@/lib/actions/mess";
import { PageHeader } from "@/components/common/PageHeader";
import { MealAttendanceClient } from "@/components/mess/MealAttendanceClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meal Attendance — Mess Management",
  description: "Mark and inspect student dining attendance for Breakfast, Lunch, Evening Snacks, and Dinner.",
};

export default async function MessAttendancePage() {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");

  const isManager = profile.role === "mess_manager" || profile.role === "super_admin";
  const todayStr = new Date().toISOString().split("T")[0];

  const { data: attendance } = await getMessAttendance(todayStr);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mess Meal Attendance"
        description="Mark and inspect daily dining logs per student for Breakfast, Lunch, Evening Snacks, and Dinner."
      />
      <MealAttendanceClient
        initialDate={todayStr}
        attendanceData={attendance || []}
        isManager={isManager}
      />
    </div>
  );
}
