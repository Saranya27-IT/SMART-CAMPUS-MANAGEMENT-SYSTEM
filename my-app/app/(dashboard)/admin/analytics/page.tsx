import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, CalendarDays, Bus, Building2, UtensilsCrossed, TrendingUp } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Campus Analytics — Smart Campus",
};

export default async function CampusAnalyticsPage() {
  const profile = await getCurrentUser();
  if (!profile || profile.role !== "super_admin") redirect("/dashboard");

  const supabase = await createClient();

  const [
    { count: totalStudents },
    { count: totalFaculty },
    { count: totalBooks },
    { count: totalEvents },
    { count: totalBuses },
    { count: totalHostels },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "faculty"),
    supabase.from("books").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("buses").select("*", { count: "exact", head: true }),
    supabase.from("hostels").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campus Analytics Overview"
        description="Comprehensive insights across all campus management modules."
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Student Population" value={totalStudents ?? 0} icon={Users} color="indigo" />
        <StatCard title="Faculty Members" value={totalFaculty ?? 0} icon={Users} color="violet" />
        <StatCard title="Library Collection" value={totalBooks ?? 0} icon={BookOpen} color="amber" />
        <StatCard title="Total Events" value={totalEvents ?? 0} icon={CalendarDays} color="emerald" />
        <StatCard title="Bus Fleet" value={totalBuses ?? 0} icon={Bus} color="cyan" />
        <StatCard title="Hostel Facilities" value={totalHostels ?? 0} icon={Building2} color="rose" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Module Activity Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-muted-foreground">Smart Library</span>
                <span className="font-semibold">{totalBooks ?? 0} Catalogue Items</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-muted-foreground">Smart Events</span>
                <span className="font-semibold">{totalEvents ?? 0} Events Created</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-muted-foreground">Smart Transport</span>
                <span className="font-semibold">{totalBuses ?? 0} Active Vehicles</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-muted-foreground">Smart Hostel</span>
                <span className="font-semibold">{totalHostels ?? 0} Hostels Managed</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Database Engine</span>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium">Supabase PostgreSQL</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Security Layer</span>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-medium">Supabase RLS Active</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Authentication</span>
              <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">Role-Based Access Control</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
