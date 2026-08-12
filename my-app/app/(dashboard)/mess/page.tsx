import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth";
import { getMenuForDate, getWeeklyMenu, getFeedback, getMessComplaints, getMessSuggestions } from "@/lib/actions/mess";
import { PageHeader } from "@/components/common/PageHeader";
import { StudentMessClient } from "@/components/mess/StudentMessClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mess — Smart Campus",
  description: "View today's menu, weekly menu, submit food ratings, complaints, and suggestions.",
};

export default async function MessPage() {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");

  const isManager = profile.role === "mess_manager" || profile.role === "super_admin";
  if (isManager) redirect("/mess-manager/dashboard");

  const todayStr = new Date().toISOString().split("T")[0];

  const [
    { data: todayMenus },
    weeklyRes,
    { data: feedbackData },
    { data: complaintsData },
    { data: suggestionsData },
  ] = await Promise.all([
    getMenuForDate(todayStr),
    getWeeklyMenu(todayStr),
    getFeedback(),
    getMessComplaints(),
    getMessSuggestions(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campus Mess & Dining Services"
        description="Inspect daily & weekly menus, rate meals, raise quality complaints, and submit dish suggestions."
      />
      <StudentMessClient
        todayMenus={todayMenus || []}
        weeklyData={weeklyRes.data || {}}
        startDate={weeklyRes.startDate}
        endDate={weeklyRes.endDate}
        userFeedback={feedbackData || []}
        userComplaints={complaintsData || []}
        userSuggestions={suggestionsData || []}
      />
    </div>
  );
}
