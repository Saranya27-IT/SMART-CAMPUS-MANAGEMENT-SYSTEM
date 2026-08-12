import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth";
import { getWeeklyMenu } from "@/lib/actions/mess";
import { PageHeader } from "@/components/common/PageHeader";
import { WeeklyMenuManagementClient } from "@/components/mess/WeeklyMenuManagementClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weekly Menu Schedule — Smart Campus",
  description: "Organize and inspect weekly dining schedules for breakfast, lunch, snacks, and dinner.",
};

export default async function MessMenuManagePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");

  const isManager = profile.role === "mess_manager" || profile.role === "super_admin";
  const params = await searchParams;
  const todayStr = new Date().toISOString().split("T")[0];
  const refDate = params?.date || todayStr;

  const weeklyRes = await getWeeklyMenu(refDate);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Weekly Mess Menu Schedule"
        description="Sunday to Saturday weekly meal planner for Breakfast, Lunch, Evening Snacks, and Dinner."
      />
      <WeeklyMenuManagementClient
        initialRefDate={refDate}
        weeklyMenus={weeklyRes.data || {}}
        rawMenus={weeklyRes.rawData || []}
        isManager={isManager}
      />
    </div>
  );
}
