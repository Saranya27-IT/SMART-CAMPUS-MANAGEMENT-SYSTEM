import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, BookOpen, CalendarDays, Bus, Building2, UtensilsCrossed, ScrollText, UserCheck } from "lucide-react";
import { ROLE_LABELS, ROLE_COLORS, USER_ROLES } from "@/lib/types/roles";
import type { UserRole } from "@/lib/types/roles";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

import { getCurrentUser } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "Admin Dashboard — Smart Campus",
};

export default async function AdminPage() {
  const profile = await getCurrentUser();
  if (!profile || profile.role !== "super_admin") redirect("/dashboard");

  const supabase = await createClient();

  const [
    { count: totalUsers },
    { count: totalStudents },
    { count: totalBooks },
    { count: totalEvents },
    { count: totalBuses },
    { count: totalHostels },
    { data: recentUsersData },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("books").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("buses").select("*", { count: "exact", head: true }),
    supabase.from("hostels").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(8),
  ]);
  const recentUsers = (recentUsersData ?? []) as any[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Complete campus overview and management."
        actions={
          <Link href="/admin/users">
            <Button className="gradient-primary text-white border-0 hover:opacity-90" id="manage-users-btn">
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </Button>
          </Link>
        }
      />

      {/* Campus stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Users" value={totalUsers ?? 0} icon={Users} color="indigo" />
        <StatCard title="Students" value={totalStudents ?? 0} icon={UserCheck} color="violet" />
        <StatCard title="Books" value={totalBooks ?? 0} icon={BookOpen} color="amber" />
        <StatCard title="Events" value={totalEvents ?? 0} icon={CalendarDays} color="emerald" />
        <StatCard title="Buses" value={totalBuses ?? 0} icon={Bus} color="cyan" />
        <StatCard title="Hostels" value={totalHostels ?? 0} icon={Building2} color="rose" />
      </div>

      {/* Module quick access */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { href: "/library", icon: BookOpen, label: "Library", color: "indigo" },
          { href: "/events", icon: CalendarDays, label: "Events", color: "amber" },
          { href: "/bus/manage", icon: Bus, label: "Bus", color: "emerald" },
          { href: "/hostel/manage", icon: Building2, label: "Hostel", color: "cyan" },
          { href: "/mess/manage", icon: UtensilsCrossed, label: "Mess", color: "rose" },
        ].map(({ href, icon: Icon, label, color }) => (
          <Link key={href} href={href}>
            <div className="p-4 rounded-xl border bg-card hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer text-center space-y-2">
              <Icon className={cn("h-6 w-6 mx-auto", {
                "text-indigo-600": color === "indigo",
                "text-amber-600": color === "amber",
                "text-emerald-600": color === "emerald",
                "text-cyan-600": color === "cyan",
                "text-rose-600": color === "rose",
              })} />
              <p className="text-sm font-medium">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent users + Audit log link */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Recent Users</CardTitle>
            <Link href="/admin/users">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(recentUsers ?? []).map((u) => (
                <div key={u.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {u.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{u.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <Badge variant="outline" className={cn("text-xs", ROLE_COLORS[u.role as UserRole])}>
                    {ROLE_LABELS[u.role as UserRole]}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">System Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {USER_ROLES.map((role) => (
              <div key={role} className="flex items-center justify-between">
                <Badge variant="outline" className={cn("text-xs", ROLE_COLORS[role])}>
                  {ROLE_LABELS[role]}
                </Badge>
                <Link href={`/admin/users?role=${role}`}>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">Manage</Button>
                </Link>
              </div>
            ))}
            <div className="pt-2 border-t">
              <Link href="/admin/audit-logs">
                <Button variant="outline" size="sm" className="w-full" id="audit-logs-btn">
                  <ScrollText className="mr-2 h-4 w-4" />
                  View Audit Logs
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
