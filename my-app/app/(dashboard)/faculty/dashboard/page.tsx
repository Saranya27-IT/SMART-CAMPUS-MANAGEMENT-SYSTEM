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
  CalendarDays, Users, Award, Bell, UserCircle, BookOpen, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/constants";
import { format } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Faculty Dashboard — Smart Campus",
  description: "Faculty member overview and campus event access.",
};

export default async function FacultyDashboardPage() {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");
  if (profile.role !== "faculty") redirect("/dashboard");

  const supabase = await createClient();
  const today = format(new Date(), "EEEE, d MMMM yyyy");

  const [
    { data: myRegistrationsData },
    { count: totalAttended },
    { count: certsEarned },
    { data: upcomingEventsData },
    { data: notificationsData },
  ] = await Promise.all([
    supabase.from("event_registrations")
      .select(`*, events(id, title, start_time, end_time, venue, status, event_categories(name, color))`)
      .eq("user_id", profile.id)
      .order("registered_at", { ascending: false })
      .limit(5),
    supabase.from("event_registrations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .eq("attended", true),
    supabase.from("event_registrations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .eq("certificate_issued", true),
    supabase.from("events")
      .select(`*, event_categories(name, color)`)
      .eq("status", "upcoming")
      .eq("allow_faculty", true)
      .order("start_time", { ascending: true })
      .limit(5),
    supabase.from("notifications")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const myRegistrations = (myRegistrationsData ?? []) as any[];
  const upcomingEvents = (upcomingEventsData ?? []) as any[];
  const notifications = (notificationsData ?? []) as any[];
  const registeredCount = myRegistrations.length;

  return (
    <div className="space-y-6">
      {/* Welcome hero */}
      <div className="rounded-2xl gradient-campus p-6 text-white">
        <p className="text-white/60 text-sm mb-1">{today}</p>
        <h1 className="text-2xl font-bold">
          Welcome back, {profile.full_name.split(" ")[0]}! 👋
        </h1>
        <p className="text-white/70 text-sm mt-1">
          Faculty · {profile.department ?? ""}
          {profile.employee_id && ` · ${profile.employee_id}`}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Events Registered"   value={registeredCount}    icon={CalendarDays} color="indigo" />
        <StatCard title="Events Attended"     value={totalAttended ?? 0} icon={Users}        color="emerald" />
        <StatCard title="Certificates Earned" value={certsEarned ?? 0}   icon={Award}        color="amber"
          subtitle="From attended events" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My registered events */}
        <Card className="border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                My Registered Events
              </CardTitle>
              <Link href="/events">
                <Button variant="outline" size="sm" className="text-xs h-7">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {myRegistrations.length === 0 ? (
              <div className="text-center py-10 px-6 text-muted-foreground">
                <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Not registered for any events</p>
                <Link href="/events">
                  <Button size="sm" className="mt-3 gradient-primary text-white border-0 text-xs">
                    Browse Events
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {myRegistrations.map((reg: any) => {
                  const ev = reg.events as any;
                  if (!ev) return null;
                  const cat = ev.event_categories as { name: string; color: string } | null;
                  return (
                    <Link
                      key={reg.id}
                      href={`/events/${ev.id}`}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors"
                    >
                      <div
                        className="w-1.5 h-10 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cat?.color ?? "#6366F1" }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{ev.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(ev.start_time), "d MMM yyyy, h:mm a")}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {reg.attended && (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">✓ Attended</Badge>
                        )}
                        <Badge variant="outline" className={cn("text-xs capitalize", STATUS_COLORS[ev.status])}>
                          {ev.status}
                        </Badge>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="space-y-4">
          {/* Upcoming events open to faculty */}
          <Card className="border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Upcoming Events
                </CardTitle>
                <Link href="/events">
                  <Button variant="outline" size="sm" className="text-xs h-7">See All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No upcoming events</p>
              ) : (
                <div className="divide-y divide-border">
                  {upcomingEvents.map((event: any) => {
                    const cat = event.event_categories as { name: string; color: string } | null;
                    return (
                      <Link
                        key={event.id}
                        href={`/events/${event.id}`}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{event.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(event.start_time), "d MMM yyyy")}
                          </p>
                        </div>
                        {cat && (
                          <Badge
                            className="text-xs text-white border-0 flex-shrink-0"
                            style={{ backgroundColor: cat.color }}
                          >
                            {cat.name}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick links */}
          <Card className="border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/events" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-700 transition-colors text-center">
                  <CalendarDays className="h-5 w-5" />
                  <span className="text-xs font-medium">Events</span>
                </Link>
                <Link href="/events/certificates" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-100 text-amber-700 transition-colors text-center">
                  <Award className="h-5 w-5" />
                  <span className="text-xs font-medium">Certificates</span>
                </Link>
                <Link href="/notifications" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-700 transition-colors text-center">
                  <Bell className="h-5 w-5" />
                  <span className="text-xs font-medium">Notifications</span>
                </Link>
                <Link href="/profile" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-violet-50 hover:bg-violet-100 border border-violet-100 text-violet-700 transition-colors text-center">
                  <UserCircle className="h-5 w-5" />
                  <span className="text-xs font-medium">My Profile</span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
