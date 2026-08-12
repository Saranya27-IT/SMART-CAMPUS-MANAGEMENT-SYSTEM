import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarDays, Users, CheckCircle, TrendingUp,
  Plus, QrCode, BarChart3, Settings2, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/constants";
import { format } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organizer Dashboard — Smart Campus",
  description: "Event organizer overview and quick actions.",
};

export default async function EventOrganizerDashboardPage() {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");
  if (profile.role !== "event_organizer" && profile.role !== "super_admin") redirect("/dashboard");

  const supabase = await createClient();

  const [
    { count: myEventsTotal },
    { count: myUpcoming },
    { count: myOngoing },
    { data: myEventsData },
    { count: totalRegistrations },
    { count: totalAttended },
    { data: recentRegs },
  ] = await Promise.all([
    supabase.from("events").select("*", { count: "exact", head: true }).eq("organizer_id", profile.id),
    supabase.from("events").select("*", { count: "exact", head: true }).eq("organizer_id", profile.id).eq("status", "upcoming"),
    supabase.from("events").select("*", { count: "exact", head: true }).eq("organizer_id", profile.id).eq("status", "ongoing"),
    supabase.from("events")
      .select(`*, event_categories(name, color)`)
      .eq("organizer_id", profile.id)
      .order("start_time", { ascending: false })
      .limit(5),
    supabase.from("event_registrations")
      .select("events!inner(organizer_id)", { count: "exact", head: true })
      .eq("events.organizer_id", profile.id),
    supabase.from("event_registrations")
      .select("events!inner(organizer_id)", { count: "exact", head: true })
      .eq("events.organizer_id", profile.id)
      .eq("attended", true),
    supabase.from("event_registrations")
      .select(`*, profiles!event_registrations_user_id_fkey(full_name, roll_number), events(title)`)
      .order("registered_at", { ascending: false })
      .limit(5),
  ]);

  const myEvents = (myEventsData ?? []) as any[];
  const recentRegistrations = (recentRegs ?? []) as any[];

  const attendanceRate = (totalRegistrations ?? 0) > 0
    ? Math.round(((totalAttended ?? 0) / (totalRegistrations ?? 1)) * 100)
    : 0;

  const today = format(new Date(), "EEEE, d MMMM yyyy");

  return (
    <div className="space-y-6">
      {/* Welcome hero */}
      <div className="rounded-2xl gradient-campus p-6 text-white">
        <p className="text-white/60 text-sm mb-1">{today}</p>
        <h1 className="text-2xl font-bold">
          Welcome back, {profile.full_name.split(" ")[0]}! 🎉
        </h1>
        <p className="text-white/70 text-sm mt-1">
          Event Organizer Dashboard · {profile.department ?? "Student Affairs"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="My Events"           value={myEventsTotal ?? 0}      icon={CalendarDays} color="indigo" />
        <StatCard title="Upcoming"            value={myUpcoming ?? 0}         icon={Clock}        color="amber" />
        <StatCard title="Total Registrations" value={totalRegistrations ?? 0} icon={Users}        color="emerald" />
        <StatCard
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          icon={CheckCircle}
          color="violet"
          subtitle={`${totalAttended ?? 0} attended`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My events list */}
        <Card className="border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                My Events
              </CardTitle>
              <Link href="/events/manage">
                <Button variant="outline" size="sm" className="text-xs h-7" id="org-manage-events-btn">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {myEvents.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground px-6">
                <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No events created yet</p>
                <Link href="/events/manage">
                  <Button size="sm" className="mt-3 gradient-primary text-white border-0 text-xs" id="org-create-first-btn">
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Create First Event
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {myEvents.map((event) => {
                  const cat = event.event_categories as { name: string; color: string } | null;
                  return (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors"
                    >
                      <div
                        className="w-1.5 h-10 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cat?.color ?? "#6366F1" }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(event.start_time), "d MMM yyyy, h:mm a")}
                        </p>
                      </div>
                      <Badge variant="outline" className={cn("text-xs capitalize flex-shrink-0", STATUS_COLORS[event.status])}>
                        {event.status}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right column: Quick actions + Recent regs */}
        <div className="space-y-4">
          {/* Quick actions */}
          <Card className="border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/events/manage" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-700 transition-colors text-center">
                  <Plus className="h-5 w-5" />
                  <span className="text-xs font-medium">Create Event</span>
                </Link>
                <Link href="/events/check-in" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-700 transition-colors text-center" id="org-quick-checkin">
                  <QrCode className="h-5 w-5" />
                  <span className="text-xs font-medium">QR Check-in</span>
                </Link>
                <Link href="/events/analytics" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-violet-50 hover:bg-violet-100 border border-violet-100 text-violet-700 transition-colors text-center">
                  <BarChart3 className="h-5 w-5" />
                  <span className="text-xs font-medium">Analytics</span>
                </Link>
                <Link href="/events" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-100 text-amber-700 transition-colors text-center">
                  <CalendarDays className="h-5 w-5" />
                  <span className="text-xs font-medium">All Events</span>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent registrations */}
          <Card className="border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Recent Registrations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentRegistrations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No registrations yet</p>
              ) : (
                <div className="divide-y divide-border">
                  {recentRegistrations.map((reg: any) => {
                    const p = reg.profiles;
                    const ev = reg.events;
                    return (
                      <div key={reg.id} className="flex items-center gap-3 px-5 py-3">
                        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                          {p?.full_name?.charAt(0) ?? "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{p?.full_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{ev?.title}</p>
                        </div>
                        {reg.attended && (
                          <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
