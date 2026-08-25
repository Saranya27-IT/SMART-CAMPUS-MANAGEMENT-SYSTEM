import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth";
import { getMenuForDate, getWeeklyMenu, getFeedback, getMessComplaints, getMessSuggestions } from "@/lib/actions/mess";
import { PageHeader } from "@/components/common/PageHeader";
import { StudentMessClient } from "@/components/mess/StudentMessClient";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert } from "lucide-react";
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

  const studentType = (profile as any)?.student_type || "HOSTELLER";
  if (profile.role === "student" && studentType === "DAY_SCHOLAR") {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Campus Mess Access Restricted"
          description="Campus dining hall and mess management services."
        />
        <div className="flex flex-col items-center justify-center min-h-[55vh] text-center p-6 space-y-4">
          <div className="w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center border border-rose-200 shadow-sm">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <div className="max-w-md space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Access Restricted</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Mess and dining services are available only for residential hostel students. Day scholar students are allocated bus transportation services instead.
            </p>
            <div className="pt-3">
              <Badge variant="outline" className="px-3 py-1 bg-amber-50 text-amber-700 border-amber-200">
                Student Status: DAY_SCHOLAR
              </Badge>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
