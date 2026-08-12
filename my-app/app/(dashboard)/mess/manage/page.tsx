import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth";
import { getMessDashboardStats } from "@/lib/actions/mess";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UtensilsCrossed, Users, AlertCircle, Star, ClipboardList, CalendarCheck, BarChart3, Lightbulb, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mess Manager Dashboard — Smart Campus",
  description: "Manage weekly menus, track meal attendance, respond to complaints, and analyze food feedback.",
};

export default async function MessManagePage() {
  const profile = await getCurrentUser();
  if (!profile || (profile.role !== "mess_manager" && profile.role !== "super_admin")) {
    redirect("/mess");
  }

  const stats = await getMessDashboardStats();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mess Manager Dashboard"
        description={`Dining operations and menu planning overview for ${format(new Date(), "EEEE, d MMMM yyyy")}`}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Today Attendance" value={stats.todayMealAttendanceCount} icon={Users} color="emerald" subtitle={`Out of ${stats.totalStudents} students`} />
        <StatCard title="Average Rating" value={stats.averageRating ? `★ ${stats.averageRating}` : "N/A"} icon={Star} color="amber" subtitle={`${stats.totalFeedbackCount} ratings`} />
        <StatCard title="Open Complaints" value={stats.pendingComplaints} icon={AlertCircle} color="rose" subtitle={`Total: ${stats.totalComplaints}`} />
        <StatCard title="New Suggestions" value={stats.pendingSuggestions} icon={Lightbulb} color="indigo" subtitle={`Total: ${stats.totalSuggestions}`} />
        <StatCard title="Today's Meals" value={stats.todayMenu.length} icon={UtensilsCrossed} color="violet" subtitle="Configured" />
        <StatCard title="Total Students" value={stats.totalStudents} icon={Users} color="cyan" />
      </div>

      {/* Quick Access Modules */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { href: "/mess/menu", icon: ClipboardList, label: "Weekly Menu CRUD", color: "text-indigo-600" },
          { href: "/mess/attendance", icon: CalendarCheck, label: "Meal Attendance", color: "text-emerald-600" },
          { href: "/mess/feedback", icon: Star, label: "Ratings & Feedback", color: "text-amber-600" },
          { href: "/mess/complaints", icon: AlertCircle, label: "Food Complaints", color: "text-rose-600", badge: stats.pendingComplaints ? `${stats.pendingComplaints} open` : undefined },
          { href: "/mess/suggestions", icon: Lightbulb, label: "Food Suggestions", color: "text-blue-600", badge: stats.pendingSuggestions ? `${stats.pendingSuggestions} new` : undefined },
          { href: "/mess/analytics", icon: BarChart3, label: "Analytics & Export", color: "text-gray-600" },
        ].map(({ href, icon: Icon, label, color, badge }) => (
          <Link key={href} href={href}>
            <div className="p-4 rounded-xl border bg-card hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer text-center space-y-1.5 relative group">
              <Icon className={cn("h-5 w-5 mx-auto transition-transform group-hover:scale-110", color)} />
              <p className="text-xs font-semibold text-foreground">{label}</p>
              {badge && (
                <Badge className="text-[10px] absolute -top-2 -right-1 bg-rose-500 text-white border-0 px-1.5 py-0.5">{badge}</Badge>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Today's Configured Menu Breakdown */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Today's Configured Menu</CardTitle>
            <CardDescription>Daily meal offerings for student dining</CardDescription>
          </div>
          <Link href="/mess/menu">
            <Button size="sm" variant="outline" className="gap-1">
              Edit Weekly Schedule <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {stats.todayMenu.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No menu items configured for today yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.todayMenu.map((m: any) => (
                <div key={m.id} className="p-3.5 rounded-xl border bg-card space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm capitalize">{m.meal_type}</span>
                    <Badge variant="outline" className="text-[10px]">{(m.items || []).length} items</Badge>
                  </div>
                  <ul className="space-y-1 text-xs">
                    {(m.items || []).map((it: string, i: number) => (
                      <li key={i} className="flex items-center gap-1.5 text-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
