import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BookOpen, CalendarDays, Bus, Building2, UtensilsCrossed, Users, TrendingUp, Bell, Library, UserCheck, BedDouble } from "lucide-react";
import { StatCard } from "@/components/common/StatCard";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/constants";
import { ROLE_LABELS } from "@/lib/types/roles";
import type { UserRole } from "@/lib/types/roles";
import type { Metadata } from "next";
import { format } from "date-fns";

import { getCurrentUser } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "Dashboard — Smart Campus",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const profile = await getCurrentUser();

  if (!profile) redirect("/login");

  const role = profile.role as UserRole;
  const today = format(new Date(), "EEEE, d MMMM yyyy");

  // Fetch stats based on role
  let stats: Array<{ title: string; value: number | string; icon: typeof BookOpen; color: "indigo" | "amber" | "emerald" | "rose" | "cyan" | "violet"; subtitle?: string }> = [];
  let recentActivity: Array<{ label: string; time: string; type: string }> = [];

  if (role === "super_admin") {
    const [
      { count: totalStudents },
      { count: totalFaculty },
      { count: totalBooks },
      { count: totalEvents },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "faculty"),
      supabase.from("books").select("*", { count: "exact", head: true }),
      supabase.from("events").select("*", { count: "exact", head: true }),
    ]);
    stats = [
      { title: "Total Students", value: totalStudents ?? 0, icon: Users, color: "indigo" },
      { title: "Total Faculty", value: totalFaculty ?? 0, icon: UserCheck, color: "violet" },
      { title: "Library Books", value: totalBooks ?? 0, icon: BookOpen, color: "amber" },
      { title: "Events", value: totalEvents ?? 0, icon: CalendarDays, color: "emerald" },
    ];
  } else if (role === "student") {
    const [
      { data: borrowsData },
      { data: registrationsData },
      { data: busAssignmentData },
      { data: messMenusData },
    ] = await Promise.all([
      supabase.from("book_borrows").select("id,status,due_date").eq("student_id", profile.id).eq("status", "borrowed"),
      supabase.from("event_registrations").select("id").eq("user_id", profile.id),
      supabase.from("student_bus_assignments").select("route_id").eq("student_id", profile.id).maybeSingle(),
      supabase.from("mess_menus").select("id,meal_type").eq("date", new Date().toISOString().split("T")[0]),
    ]);
    const borrows = (borrowsData ?? []) as any[];
    const registrations = (registrationsData ?? []) as any[];
    const busAssignment = busAssignmentData as any;
    const messMenus = (messMenusData ?? []) as any[];
    const overdue = borrows.filter(b => new Date(b.due_date) < new Date());
    stats = [
      { title: "Books Borrowed", value: borrows.length, icon: BookOpen, color: "indigo", subtitle: overdue.length > 0 ? `${overdue.length} overdue` : "All on time" },
      { title: "Events Registered", value: registrations.length, icon: CalendarDays, color: "amber" },
      { title: "Bus Route", value: busAssignment ? "Assigned" : "Not assigned", icon: Bus, color: "emerald" },
      { title: "Today's Meals", value: messMenus.length, icon: UtensilsCrossed, color: "rose", subtitle: "Available today" },
    ];
  } else if (role === "librarian") {
    const [
      { count: totalBooks },
      { count: activeBorrows },
      { count: overdue },
      { count: totalMembers },
    ] = await Promise.all([
      supabase.from("books").select("*", { count: "exact", head: true }),
      supabase.from("book_borrows").select("*", { count: "exact", head: true }).eq("status", "borrowed"),
      supabase.from("book_borrows").select("*", { count: "exact", head: true }).eq("status", "overdue"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
    ]);
    stats = [
      { title: "Total Books", value: totalBooks ?? 0, icon: Library, color: "indigo" },
      { title: "Active Borrows", value: activeBorrows ?? 0, icon: BookOpen, color: "amber" },
      { title: "Overdue Books", value: overdue ?? 0, icon: TrendingUp, color: "rose" },
      { title: "Total Members", value: totalMembers ?? 0, icon: Users, color: "emerald" },
    ];
  } else if (role === "event_organizer") {
    const [
      { count: totalEvents },
      { count: upcoming },
      { count: totalRegistrations },
    ] = await Promise.all([
      supabase.from("events").select("*", { count: "exact", head: true }).eq("organizer_id", profile.id),
      supabase.from("events").select("*", { count: "exact", head: true }).eq("organizer_id", profile.id).eq("status", "upcoming"),
      supabase.from("event_registrations").select("events!inner(organizer_id)", { count: "exact", head: true }).eq("events.organizer_id", profile.id),
    ]);
    stats = [
      { title: "My Events", value: totalEvents ?? 0, icon: CalendarDays, color: "indigo" },
      { title: "Upcoming", value: upcoming ?? 0, icon: CalendarDays, color: "amber" },
      { title: "Total Registrations", value: totalRegistrations ?? 0, icon: Users, color: "emerald" },
    ];
  } else if (role === "bus_driver") {
    const [{ count: totalTrips }, { data: todayTripData }] = await Promise.all([
      supabase.from("bus_trips").select("*", { count: "exact", head: true }).eq("driver_id", profile.id),
      supabase.from("bus_trips").select("*").eq("driver_id", profile.id).eq("trip_date", new Date().toISOString().split("T")[0]).order("created_at", { ascending: false }).limit(1),
    ]);
    const todayTrip = (todayTripData ?? []) as any[];
    stats = [
      { title: "Total Trips", value: totalTrips ?? 0, icon: Bus, color: "indigo" },
      { title: "Today's Status", value: todayTrip[0]?.status ?? "No trip", icon: Bus, color: "amber" },
    ];
  } else if (role === "hostel_warden") {
    const [
      { count: totalBeds },
      { count: occupiedBeds },
      { count: pendingLeaves },
      { count: openComplaints },
    ] = await Promise.all([
      supabase.from("hostel_beds").select("*", { count: "exact", head: true }),
      supabase.from("hostel_beds").select("*", { count: "exact", head: true }).eq("status", "occupied"),
      supabase.from("leave_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("hostel_complaints").select("*", { count: "exact", head: true }).eq("status", "open"),
    ]);
    stats = [
      { title: "Total Beds", value: totalBeds ?? 0, icon: BedDouble, color: "indigo" },
      { title: "Occupied Beds", value: occupiedBeds ?? 0, icon: Building2, color: "emerald" },
      { title: "Pending Leaves", value: pendingLeaves ?? 0, icon: CalendarDays, color: "amber" },
      { title: "Open Complaints", value: openComplaints ?? 0, icon: TrendingUp, color: "rose" },
    ];
  } else if (role === "mess_manager") {
    const todayStr = new Date().toISOString().split("T")[0];
    const [
      { count: todayMenus },
      { count: todayAttendance },
      { count: openComplaints },
      { data: avgFeedbackData },
    ] = await Promise.all([
      supabase.from("mess_menus").select("*", { count: "exact", head: true }).eq("date", todayStr),
      supabase.from("mess_attendance").select("*", { count: "exact", head: true }).eq("date", todayStr).eq("present", true),
      supabase.from("mess_complaints").select("*", { count: "exact", head: true }).eq("status", "open"),
      supabase.from("mess_feedback").select("rating").eq("date", todayStr),
    ]);
    const avgFeedback = (avgFeedbackData ?? []) as any[];
    const avg = avgFeedback.length > 0
      ? (avgFeedback.reduce((s, f) => s + f.rating, 0) / avgFeedback.length).toFixed(1)
      : "N/A";
    stats = [
      { title: "Today's Menus", value: todayMenus ?? 0, icon: UtensilsCrossed, color: "indigo" },
      { title: "Meal Attendance", value: todayAttendance ?? 0, icon: Users, color: "emerald" },
      { title: "Open Complaints", value: openComplaints ?? 0, icon: TrendingUp, color: "rose" },
      { title: "Avg Rating Today", value: avg, icon: TrendingUp, color: "amber" },
    ];
  }

  // Recent notifications
  const { data: notificationsData } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const notifications = (notificationsData ?? []) as any[];

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="rounded-2xl gradient-campus p-6 text-white">
        <p className="text-white/60 text-sm mb-1">{today}</p>
        <h1 className="text-2xl font-bold">
          Welcome back, {profile.full_name.split(" ")[0]}! 👋
        </h1>
        <p className="text-white/70 text-sm mt-1">
          {ROLE_LABELS[role]} Dashboard
          {profile.roll_number && ` · ${profile.roll_number}`}
          {profile.department && ` · ${profile.department}`}
        </p>
      </div>

      {/* Stats */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              subtitle={stat.subtitle}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>
      )}

      {/* Recent notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!notifications || notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No notifications yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {notifications.map((notif) => (
                  <li key={notif.id} className="flex items-start gap-3">
                    <div className={cn(
                      "mt-0.5 h-2 w-2 rounded-full flex-shrink-0",
                      notif.read ? "bg-muted-foreground/30" : "bg-primary"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm", !notif.read && "font-medium")}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {notif.message}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-0.5">
                        {format(new Date(notif.created_at), "d MMM, h:mm a")}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {notif.type}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Quick links */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {role === "student" && (
                <>
                  <QuickLink href="/library/books" icon={BookOpen} label="Browse Books" color="indigo" />
                  <QuickLink href="/events" icon={CalendarDays} label="View Events" color="amber" />
                  <QuickLink href="/hostel" icon={Building2} label="My Hostel" color="emerald" />
                  <QuickLink href="/mess" icon={UtensilsCrossed} label="Today's Menu" color="rose" />
                </>
              )}
              {role === "librarian" && (
                <>
                  <QuickLink href="/library/books/new" icon={BookOpen} label="Add Book" color="indigo" />
                  <QuickLink href="/library/borrows" icon={Library} label="Borrow/Return" color="amber" />
                  <QuickLink href="/library/fines" icon={TrendingUp} label="Manage Fines" color="rose" />
                  <QuickLink href="/library/analytics" icon={TrendingUp} label="Analytics" color="emerald" />
                </>
              )}
              {role === "hostel_warden" && (
                <>
                  <QuickLink href="/hostel/rooms" icon={Building2} label="Rooms" color="indigo" />
                  <QuickLink href="/hostel/leaves" icon={Bell} label="Leave Requests" color="amber" />
                  <QuickLink href="/hostel/complaints" icon={TrendingUp} label="Complaints" color="rose" />
                  <QuickLink href="/hostel/attendance" icon={UserCheck} label="Attendance" color="emerald" />
                </>
              )}
              {role === "event_organizer" && (
                <>
                  <QuickLink href="/events/manage" icon={CalendarDays} label="My Events" color="indigo" />
                  <QuickLink href="/events" icon={CalendarDays} label="All Events" color="amber" />
                  <QuickLink href="/events/analytics" icon={TrendingUp} label="Analytics" color="emerald" />
                </>
              )}
              {role === "mess_manager" && (
                <>
                  <QuickLink href="/mess/menu" icon={UtensilsCrossed} label="Manage Menu" color="indigo" />
                  <QuickLink href="/mess/attendance" icon={Users} label="Attendance" color="amber" />
                  <QuickLink href="/mess/complaints" icon={TrendingUp} label="Complaints" color="rose" />
                  <QuickLink href="/mess/analytics" icon={TrendingUp} label="Analytics" color="emerald" />
                </>
              )}
              {role === "bus_driver" && (
                <>
                  <QuickLink href="/bus/trips" icon={Bus} label="My Trips" color="indigo" />
                </>
              )}
              {role === "super_admin" && (
                <>
                  <QuickLink href="/admin/users" icon={Users} label="Manage Users" color="indigo" />
                  <QuickLink href="/admin/audit-logs" icon={TrendingUp} label="Audit Logs" color="amber" />
                  <QuickLink href="/library" icon={BookOpen} label="Library" color="emerald" />
                  <QuickLink href="/events" icon={CalendarDays} label="Events" color="rose" />
                </>
              )}
              {role === "faculty" && (
                <>
                  <QuickLink href="/events" icon={CalendarDays} label="Events" color="indigo" />
                  <QuickLink href="/profile" icon={UserCheck} label="My Profile" color="amber" />
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
  color,
}: {
  href: string;
  icon: typeof BookOpen;
  label: string;
  color: "indigo" | "amber" | "emerald" | "rose" | "cyan" | "violet";
}) {
  const colorMap = {
    indigo: "bg-indigo-50 hover:bg-indigo-100 border-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/50 dark:border-indigo-900 dark:text-indigo-300",
    amber: "bg-amber-50 hover:bg-amber-100 border-amber-100 text-amber-700 dark:bg-amber-950/30 dark:hover:bg-amber-950/50 dark:border-amber-900 dark:text-amber-300",
    emerald: "bg-emerald-50 hover:bg-emerald-100 border-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 dark:border-emerald-900 dark:text-emerald-300",
    rose: "bg-rose-50 hover:bg-rose-100 border-rose-100 text-rose-700 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 dark:border-rose-900 dark:text-rose-300",
    cyan: "bg-cyan-50 hover:bg-cyan-100 border-cyan-100 text-cyan-700",
    violet: "bg-violet-50 hover:bg-violet-100 border-violet-100 text-violet-700",
  };
  return (
    <a
      href={href}
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-colors text-center",
        colorMap[color]
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs font-medium leading-tight">{label}</span>
    </a>
  );
}
