import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/actions/auth";
import { getMessDashboardStats, getFeedback, getMessComplaints, getMessSuggestions } from "@/lib/actions/mess";
import { PageHeader } from "@/components/common/PageHeader";
import { MessAnalyticsClient } from "@/components/mess/MessAnalyticsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mess Analytics & Export — Smart Campus",
  description: "Inspect dining analytics and export mess datasets to CSV/Excel format.",
};

export default async function MessAnalyticsPage() {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");

  const isManager = profile.role === "mess_manager" || profile.role === "super_admin";
  if (!isManager) redirect("/mess");

  const supabase = await createClient();

  const [
    stats,
    { data: menusData },
    { data: attendanceData },
    { data: feedbackData },
    { data: complaintsData },
    { data: suggestionsData },
  ] = await Promise.all([
    getMessDashboardStats(),
    supabase.from("mess_menus").select("*").order("date", { ascending: false }),
    supabase.from("mess_attendance").select("*, profiles!mess_attendance_student_id_fkey(full_name, roll_number)").order("date", { ascending: false }).limit(200),
    getFeedback(),
    getMessComplaints(),
    getMessSuggestions(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mess Analytics & Data Export"
        description="Inspect food ratings, complaint resolution ratios, suggestion trends, and export mess datasets in CSV/Excel format."
      />
      <MessAnalyticsClient
        stats={stats}
        menusData={menusData || []}
        attendanceData={attendanceData || []}
        feedbackData={feedbackData || []}
        complaintsData={complaintsData || []}
        suggestionsData={suggestionsData || []}
      />
    </div>
  );
}
