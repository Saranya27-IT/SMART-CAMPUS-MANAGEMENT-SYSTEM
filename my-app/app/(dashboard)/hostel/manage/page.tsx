import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth";
import { getHostels, getWardenDashboardStats } from "@/lib/actions/hostel";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Building2, BedDouble, UserCheck, ClipboardList, AlertCircle, CreditCard, CalendarCheck, BarChart3, Wrench, ArrowRight, ShieldCheck, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hostel Warden Dashboard — Smart Campus",
  description: "Overview of room allocations, maintenance, fees, leaves, and attendance.",
};

export default async function HostelManagePage() {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");

  const isWarden = profile.role === "hostel_warden" || profile.role === "super_admin";
  if (!isWarden) redirect("/hostel");

  const stats = await getWardenDashboardStats();
  const hostelsResult = await getHostels();
  const hostels = (hostelsResult.data ?? []) as any[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hostel Administration Dashboard"
        description="Comprehensive view of hostel operations, room availability, student leaves, complaints, and fee dues."
      />

      {/* Main KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Hostel Students" value={stats.totalHostelStudents} icon={UserCheck} color="emerald" subtitle={`Out of ${stats.totalStudents}`} />
        <StatCard title="Total Rooms" value={stats.totalRooms} icon={Building2} color="indigo" />
        <StatCard title="Occupied Rooms" value={stats.occupiedRooms} icon={BedDouble} color="indigo" />
        <StatCard title="Available Rooms" value={stats.availableRooms} icon={ShieldCheck} color="emerald" />
        <StatCard title="Under Maintenance" value={stats.maintenanceRooms} icon={Wrench} color="rose" />
        <StatCard title="Pending Fees" value={`₹${stats.pendingFeesTotal}`} icon={CreditCard} color="violet" subtitle={`${stats.upcomingFeeDeadlinesCount} upcoming deadlines`} />
      </div>

      {/* Quick Access Modules Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { href: "/hostel/rooms", icon: Building2, label: "Rooms & Condition", color: "text-indigo-600" },
          { href: "/hostel/allocations", icon: UserCheck, label: "Bed Allocations", color: "text-emerald-600" },
          { href: "/hostel/leaves", icon: ClipboardList, label: "Leaves", color: "text-amber-600", badge: stats.pendingLeaves ? `${stats.pendingLeaves} pending` : undefined },
          { href: "/hostel/complaints", icon: AlertCircle, label: "Complaints", color: "text-rose-600", badge: stats.pendingComplaints ? `${stats.pendingComplaints} open` : undefined },
          { href: "/hostel/attendance", icon: CalendarCheck, label: "Attendance", color: "text-cyan-600" },
          { href: "/hostel/fees", icon: CreditCard, label: "Hostel Fees", color: "text-violet-600" },
          { href: "/hostel/analytics", icon: BarChart3, label: "Export & Analytics", color: "text-gray-600" },
        ].map(({ href, icon: Icon, label, color, badge }) => (
          <Link key={href} href={href}>
            <div className="p-3.5 rounded-xl border bg-card hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer text-center space-y-1.5 relative group">
              <Icon className={cn("h-5 w-5 mx-auto transition-transform group-hover:scale-110", color)} />
              <p className="text-xs font-semibold text-foreground">{label}</p>
              {badge && (
                <Badge className="text-[10px] absolute -top-2 -right-1 bg-rose-500 text-white border-0 px-1.5 py-0.5">{badge}</Badge>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Room Status Breakdown */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Room Condition & Status</CardTitle>
            <CardDescription>Live breakdown of hostel rooms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-2.5 rounded-lg border">
              <span className="text-sm font-medium">Full Rooms</span>
              <Badge variant="secondary">{stats.occupiedRooms}</Badge>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg border">
              <span className="text-sm font-medium">Partially Occupied</span>
              <Badge variant="outline">{stats.partiallyOccupiedRooms}</Badge>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg border">
              <span className="text-sm font-medium">Available Rooms</span>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">{stats.availableRooms}</Badge>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg border">
              <span className="text-sm font-medium">Under Maintenance</span>
              <Badge className="bg-rose-100 text-rose-700 border-rose-200">{stats.maintenanceRooms}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Today's Attendance Overview */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Today's Hostel Attendance</CardTitle>
            <CardDescription>Marked status for allocated students</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-2.5 rounded-lg border">
              <span className="text-sm font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Present
              </span>
              <span className="font-bold text-emerald-600">{stats.attendanceToday.present}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg border">
              <span className="text-sm font-medium flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" /> Absent
              </span>
              <span className="font-bold text-rose-600">{stats.attendanceToday.absent}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg border">
              <span className="text-sm font-medium flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" /> On Approved Leave
              </span>
              <span className="font-bold text-amber-600">{stats.attendanceToday.onLeave}</span>
            </div>
            <div className="pt-2">
              <Link href="/hostel/attendance">
                <Button size="sm" variant="outline" className="w-full gap-1">
                  Mark Room-wise Attendance <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Action Items</CardTitle>
            <CardDescription>Tasks requiring warden action</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/hostel/leaves" className="block">
              <div className="p-3 rounded-lg border hover:border-amber-400 transition-colors flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Leave Requests</p>
                  <p className="text-xs text-muted-foreground">{stats.pendingLeaves} pending approvals</p>
                </div>
                <Badge className="bg-amber-100 text-amber-700 border-amber-200">Review</Badge>
              </div>
            </Link>
            <Link href="/hostel/complaints" className="block">
              <div className="p-3 rounded-lg border hover:border-rose-400 transition-colors flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Hostel Complaints</p>
                  <p className="text-xs text-muted-foreground">{stats.pendingComplaints} open issues</p>
                </div>
                <Badge className="bg-rose-100 text-rose-700 border-rose-200">Resolve</Badge>
              </div>
            </Link>
            <Link href="/hostel/allocations" className="block">
              <div className="p-3 rounded-lg border hover:border-indigo-400 transition-colors flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Room Allocations</p>
                  <p className="text-xs text-muted-foreground">Allocate/deallocate student beds</p>
                </div>
                <Badge variant="outline">Manage</Badge>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Hostels List */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Campus Hostels</CardTitle>
            <CardDescription>Configured hostels and warden assignments</CardDescription>
          </div>
          <Link href="/hostel/rooms">
            <Button size="sm" variant="outline">View All Rooms</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {hostels.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No hostels found in database.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {hostels.map((hostel: any) => (
                <div key={hostel.id} className="p-4 rounded-xl border bg-card space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base">{hostel.name}</span>
                    <Badge variant="outline" className="capitalize text-xs">{hostel.type}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{hostel.address || "Main Campus"}</p>
                  <p className="text-xs font-medium text-primary">Warden: {hostel.profiles?.full_name || "Assigned"}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
