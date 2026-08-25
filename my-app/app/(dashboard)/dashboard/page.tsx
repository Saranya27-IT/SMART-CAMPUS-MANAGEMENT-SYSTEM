import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BookOpen, CalendarDays, Bus, Building2, UtensilsCrossed, Users, TrendingUp, Bell, Library, UserCheck, BedDouble, ArrowUpRight, Sparkles } from "lucide-react";
import { StatCard, type StatCardColor } from "@/components/common/StatCard";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/constants";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/types/roles";
import type { UserRole } from "@/lib/types/roles";
import type { Metadata } from "next";
import { format } from "date-fns";

import { getCurrentUser } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "Dashboard — Smart Campus",
  description: "Unified campus operations, resource management, and services portal.",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const profile = await getCurrentUser();

  if (!profile) redirect("/login");

  const role = profile.role as UserRole;
  const today = format(new Date(), "EEEE, d MMMM yyyy");

  // Fetch stats based on role
  let stats: Array<{
    title: string;
    value: number | string;
    icon: any;
    color: StatCardColor;
    subtitle?: string;
  }> = [];

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
      { title: "Total Students", value: totalStudents ?? 0, icon: Users, color: "blue" },
      { title: "Total Faculty", value: totalFaculty ?? 0, icon: UserCheck, color: "indigo" },
      { title: "Library Books", value: totalBooks ?? 0, icon: BookOpen, color: "cyan" },
      { title: "Active Events", value: totalEvents ?? 0, icon: CalendarDays, color: "pink" },
    ];
  } else if (role === "student") {
    const isHosteller = ((profile as any)?.student_type || "HOSTELLER") === "HOSTELLER";
    const [
      { data: borrowsData },
      { data: registrationsData },
      { data: busAssignmentData },
      { data: messMenusData },
      { data: hostelAllocationData },
    ] = await Promise.all([
      supabase.from("book_borrows").select("id,status,due_date").eq("student_id", profile.id).eq("status", "borrowed"),
      supabase.from("event_registrations").select("id").eq("user_id", profile.id),
      supabase.from("student_bus_assignments").select("route_id").eq("student_id", profile.id).maybeSingle(),
      supabase.from("mess_menus").select("id,meal_type").eq("date", new Date().toISOString().split("T")[0]),
      supabase.from("hostel_allocations").select("id,room_id").eq("student_id", profile.id).maybeSingle(),
    ]);

    const borrows = (borrowsData ?? []) as any[];
    const registrations = (registrationsData ?? []) as any[];
    const busAssignment = busAssignmentData as any;
    const messMenus = (messMenusData ?? []) as any[];
    const hostelAllocation = hostelAllocationData as any;
    const overdue = borrows.filter((b) => new Date(b.due_date) < new Date());

    stats = [
      {
        title: "Library Books",
        value: borrows.length,
        icon: BookOpen,
        color: "cyan",
        subtitle: overdue.length > 0 ? `${overdue.length} overdue` : "Active borrowed",
      },
      {
        title: "Events Joined",
        value: registrations.length,
        icon: CalendarDays,
        color: "pink",
        subtitle: "Upcoming & attended",
      },
      ...(isHosteller
        ? [
            {
              title: "Hostel Bed",
              value: hostelAllocation ? "Assigned" : "Pending",
              icon: Building2,
              color: "purple" as StatCardColor,
              subtitle: "Residential wing",
            },
            {
              title: "Today's Meals",
              value: messMenus.length,
              icon: UtensilsCrossed,
              color: "orange" as StatCardColor,
              subtitle: "Menu scheduled",
            },
          ]
        : [
            {
              title: "Bus Route",
              value: busAssignment ? "Assigned" : "Unassigned",
              icon: Bus,
              color: "emerald" as StatCardColor,
              subtitle: "Transit pass active",
            },
            {
              title: "Campus Access",
              value: "Day Scholar",
              icon: Users,
              color: "teal" as StatCardColor,
              subtitle: "Valid ID active",
            },
          ]),
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
      { title: "Total Books", value: totalBooks ?? 0, icon: Library, color: "cyan" },
      { title: "Active Borrows", value: activeBorrows ?? 0, icon: BookOpen, color: "blue" },
      { title: "Overdue Books", value: overdue ?? 0, icon: TrendingUp, color: "rose" },
      { title: "Student Members", value: totalMembers ?? 0, icon: Users, color: "emerald" },
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
      { title: "My Events", value: totalEvents ?? 0, icon: CalendarDays, color: "pink" },
      { title: "Upcoming Sessions", value: upcoming ?? 0, icon: CalendarDays, color: "violet" },
      { title: "Total Registrations", value: totalRegistrations ?? 0, icon: Users, color: "emerald" },
    ];
  } else if (role === "bus_driver") {
    const [{ count: totalTrips }, { data: todayTripData }] = await Promise.all([
      supabase.from("bus_trips").select("*", { count: "exact", head: true }).eq("driver_id", profile.id),
      supabase.from("bus_trips").select("*").eq("driver_id", profile.id).eq("trip_date", new Date().toISOString().split("T")[0]).order("created_at", { ascending: false }).limit(1),
    ]);
    const todayTrip = (todayTripData ?? []) as any[];
    stats = [
      { title: "Total Trips Completed", value: totalTrips ?? 0, icon: Bus, color: "emerald" },
      { title: "Today's Schedule", value: todayTrip[0]?.status ?? "Ready for departure", icon: Bus, color: "teal" },
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
      { title: "Total Beds", value: totalBeds ?? 0, icon: BedDouble, color: "purple" },
      { title: "Occupied Beds", value: occupiedBeds ?? 0, icon: Building2, color: "indigo" },
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
      { title: "Today's Menus", value: todayMenus ?? 0, icon: UtensilsCrossed, color: "orange" },
      { title: "Meal Attendance", value: todayAttendance ?? 0, icon: Users, color: "emerald" },
      { title: "Open Complaints", value: openComplaints ?? 0, icon: TrendingUp, color: "rose" },
      { title: "Avg Dining Rating", value: avg !== "N/A" ? `${avg} / 5` : "No ratings yet", icon: TrendingUp, color: "amber" },
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
      {/* Welcome Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 -mb-12 w-48 h-48 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> {today}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back, {profile.full_name.split(" ")[0]}! 👋
            </h1>
            <p className="text-sm text-indigo-200/80 font-medium">
              {ROLE_LABELS[role]} Portal
              {profile.roll_number && ` · Roll No: ${profile.roll_number}`}
              {profile.department && ` · Dept: ${profile.department}`}
              {(profile as any).student_type && ` · Category: ${(profile as any).student_type}`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge className={cn("px-3 py-1 text-xs font-bold uppercase tracking-wider border shadow-sm", ROLE_COLORS[role])}>
              {ROLE_LABELS[role]}
            </Badge>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
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

      {/* Main Content Grid: Notifications & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Notifications */}
        <Card className="rounded-2xl border shadow-xs overflow-hidden">
          <CardHeader className="pb-3 border-b bg-muted/20">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 flex items-center justify-center">
                  <Bell className="h-4 w-4" />
                </div>
                Recent Notifications
              </CardTitle>
              <Link href="/notifications" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                View All <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {!notifications || notifications.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <Bell className="w-8 h-8 mx-auto text-muted-foreground/40" />
                <p className="text-sm font-semibold text-muted-foreground">All caught up!</p>
                <p className="text-xs text-muted-foreground/70">No unread notifications.</p>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {notifications.map((notif) => (
                  <li
                    key={notif.id}
                    className="flex items-start gap-3 p-3 rounded-xl border bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div
                      className={cn(
                        "mt-1.5 h-2 w-2 rounded-full flex-shrink-0",
                        notif.read ? "bg-muted-foreground/30" : "bg-amber-500 animate-pulse ring-2 ring-amber-300/40"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-xs leading-snug", !notif.read ? "font-bold text-foreground" : "text-muted-foreground")}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1 font-mono">
                        {format(new Date(notif.created_at), "d MMM, h:mm a")}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono flex-shrink-0">
                      {notif.type}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions with Module Colors */}
        <Card className="rounded-2xl border shadow-xs overflow-hidden">
          <CardHeader className="pb-3 border-b bg-muted/20">
            <CardTitle className="text-base font-bold">Quick Operations & Modules</CardTitle>
            <CardDescription className="text-xs">Direct shortcuts to frequent tasks</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {role === "student" && (
                <>
                  <QuickLink href="/library/books" icon={BookOpen} label="Catalogue" subtitle="Search books" color="cyan" />
                  <QuickLink href="/events" icon={CalendarDays} label="Campus Events" subtitle="Workshops & fests" color="pink" />
                  {((profile as any)?.student_type || "HOSTELLER") === "HOSTELLER" ? (
                    <>
                      <QuickLink href="/hostel" icon={Building2} label="Hostel Portal" subtitle="Bed & leave status" color="purple" />
                      <QuickLink href="/mess" icon={UtensilsCrossed} label="Mess Menu" subtitle="Weekly dining schedule" color="orange" />
                    </>
                  ) : (
                    <>
                      <QuickLink href="/bus/my-bus" icon={Bus} label="Transit Pass" subtitle="Assigned route & stop" color="emerald" />
                      <QuickLink href="/bus/live-status" icon={Bus} label="Live Telemetry" subtitle="Real-time tracking" color="teal" />
                    </>
                  )}
                </>
              )}
              {role === "librarian" && (
                <>
                  <QuickLink href="/library/books/new" icon={BookOpen} label="Register Book" subtitle="Add new catalog item" color="cyan" />
                  <QuickLink href="/library/borrows" icon={Library} label="Issue & Return" subtitle="Scan QR barcodes" color="blue" />
                  <QuickLink href="/library/fines" icon={TrendingUp} label="Fine Management" subtitle="Overdue penalty dues" color="rose" />
                  <QuickLink href="/library/analytics" icon={TrendingUp} label="Library Insights" subtitle="Circulation reports" color="emerald" />
                </>
              )}
              {role === "hostel_warden" && (
                <>
                  <QuickLink href="/hostel/rooms" icon={Building2} label="Room Directory" subtitle="Inspect bed occupancy" color="purple" />
                  <QuickLink href="/hostel/leaves" icon={Bell} label="Leave Approvals" subtitle="Review student leaves" color="amber" />
                  <QuickLink href="/hostel/complaints" icon={TrendingUp} label="Complaints" subtitle="Maintenance dispatch" color="rose" />
                  <QuickLink href="/hostel/attendance" icon={UserCheck} label="Night Roll Call" subtitle="Attendance logs" color="emerald" />
                </>
              )}
              {role === "event_organizer" && (
                <>
                  <QuickLink href="/events/manage" icon={CalendarDays} label="My Events" subtitle="Create & edit workshops" color="pink" />
                  <QuickLink href="/events/check-in" icon={CalendarDays} label="QR Check-in" subtitle="Live attendance scan" color="violet" />
                  <QuickLink href="/events/certificates" icon={TrendingUp} label="Certificates" subtitle="Issue verification tokens" color="amber" />
                  <QuickLink href="/events/analytics" icon={TrendingUp} label="Registrations" subtitle="Turnout analysis" color="emerald" />
                </>
              )}
              {role === "mess_manager" && (
                <>
                  <QuickLink href="/mess/menu" icon={UtensilsCrossed} label="Weekly Menu" subtitle="Configure 7-day meal plan" color="orange" />
                  <QuickLink href="/mess/attendance" icon={Users} label="Meal Scans" subtitle="Daily dining count" color="amber" />
                  <QuickLink href="/mess/complaints" icon={TrendingUp} label="Dining Complaints" subtitle="Food & hygiene tickets" color="rose" />
                  <QuickLink href="/mess/analytics" icon={TrendingUp} label="Waste Analytics" subtitle="Consumption reports" color="emerald" />
                </>
              )}
              {role === "bus_driver" && (
                <>
                  <QuickLink href="/bus/trips" icon={Bus} label="Start Route Trip" subtitle="Log departure telemetry" color="emerald" />
                  <QuickLink href="/bus/live-status" icon={Bus} label="Live GPS Tracking" subtitle="Broadcast waypoints" color="teal" />
                </>
              )}
              {role === "super_admin" && (
                <>
                  <QuickLink href="/admin/users" icon={Users} label="User Directory" subtitle="Provision & edit accounts" color="blue" />
                  <QuickLink href="/admin/audit-logs" icon={TrendingUp} label="Audit Security" subtitle="Compliance activity log" color="indigo" />
                  <QuickLink href="/library" icon={BookOpen} label="Library System" subtitle="Full catalog access" color="cyan" />
                  <QuickLink href="/events" icon={CalendarDays} label="Campus Events" subtitle="Institution calendars" color="pink" />
                </>
              )}
              {role === "faculty" && (
                <>
                  <QuickLink href="/events" icon={CalendarDays} label="Academic Events" subtitle="Conferences & seminars" color="pink" />
                  <QuickLink href="/profile" icon={UserCheck} label="Faculty Profile" subtitle="Account credentials" color="violet" />
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
  subtitle,
  color,
}: {
  href: string;
  icon: any;
  label: string;
  subtitle?: string;
  color: StatCardColor;
}) {
  const colorClasses: Record<StatCardColor, string> = {
    blue: "bg-blue-50/70 text-blue-800 border-blue-200/80 hover:bg-blue-100 hover:border-blue-300 dark:bg-blue-950/30 dark:text-blue-200 dark:border-blue-800/60",
    indigo: "bg-indigo-50/70 text-indigo-800 border-indigo-200/80 hover:bg-indigo-100 hover:border-indigo-300 dark:bg-indigo-950/30 dark:text-indigo-200 dark:border-indigo-800/60",
    purple: "bg-purple-50/70 text-purple-800 border-purple-200/80 hover:bg-purple-100 hover:border-purple-300 dark:bg-purple-950/30 dark:text-purple-200 dark:border-purple-800/60",
    violet: "bg-violet-50/70 text-violet-800 border-violet-200/80 hover:bg-violet-100 hover:border-violet-300 dark:bg-violet-950/30 dark:text-violet-200 dark:border-violet-800/60",
    cyan: "bg-cyan-50/70 text-cyan-800 border-cyan-200/80 hover:bg-cyan-100 hover:border-cyan-300 dark:bg-cyan-950/30 dark:text-cyan-200 dark:border-cyan-800/60",
    pink: "bg-pink-50/70 text-pink-800 border-pink-200/80 hover:bg-pink-100 hover:border-pink-300 dark:bg-pink-950/30 dark:text-pink-200 dark:border-pink-800/60",
    rose: "bg-rose-50/70 text-rose-800 border-rose-200/80 hover:bg-rose-100 hover:border-rose-300 dark:bg-rose-950/30 dark:text-rose-200 dark:border-rose-800/60",
    emerald: "bg-emerald-50/70 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100 hover:border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-200 dark:border-emerald-800/60",
    teal: "bg-teal-50/70 text-teal-800 border-teal-200/80 hover:bg-teal-100 hover:border-teal-300 dark:bg-teal-950/30 dark:text-teal-200 dark:border-teal-800/60",
    amber: "bg-amber-50/70 text-amber-800 border-amber-200/80 hover:bg-amber-100 hover:border-amber-300 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-800/60",
    orange: "bg-orange-50/70 text-orange-800 border-orange-200/80 hover:bg-orange-100 hover:border-orange-300 dark:bg-orange-950/30 dark:text-orange-200 dark:border-orange-800/60",
  };

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 p-3.5 rounded-2xl border transition-all duration-200 group hover:shadow-xs",
        colorClasses[color] || colorClasses.indigo
      )}
    >
      <div className="p-2 rounded-xl bg-white/70 dark:bg-black/30 shadow-xs flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold truncate leading-tight">{label}</p>
        {subtitle && <p className="text-[10px] opacity-75 truncate mt-0.5">{subtitle}</p>}
      </div>
    </Link>
  );
}
