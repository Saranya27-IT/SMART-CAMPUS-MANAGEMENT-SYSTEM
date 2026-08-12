import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/actions/auth";
import { getBusDashboardStats } from "@/lib/actions/bus";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bus, Route, MapPin, UserCheck, AlertTriangle, BarChart3, ChevronRight, UserPlus, ShieldAlert } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bus Management Dashboard — Smart Campus",
  description: "Administrative overview for campus transport fleet, routes, stops, driver allocations, and complaints.",
};

export default async function AdminBusManagePage() {
  const profile = await getCurrentUser();
  if (!profile || profile.role !== "super_admin") {
    redirect("/dashboard");
  }

  const stats = await getBusDashboardStats();

  const quickModules = [
    {
      title: "Bus Fleet Management",
      desc: "Register buses, update capacity, status, and driver allocations.",
      href: "/bus/buses",
      icon: Bus,
      badge: `${stats.totalBuses} Buses`,
      color: "text-primary bg-primary/10",
    },
    {
      title: "Shuttle Routes",
      desc: "Manage starting areas, destinations, and active campus shuttle routes.",
      href: "/bus/routes",
      icon: Route,
      badge: `${stats.totalRoutes} Routes`,
      color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950/40",
    },
    {
      title: "Bus Stops Sequence",
      desc: "Set boarding stop sequence numbers and expected arrival times.",
      href: "/bus/stops",
      icon: MapPin,
      badge: `${stats.totalStops} Stops`,
      color: "text-blue-600 bg-blue-100 dark:bg-blue-950/40",
    },
    {
      title: "Student Bus Allocations",
      desc: "Allocate Day Scholar students to active shuttle buses and stops.",
      href: "/bus/allocations",
      icon: UserCheck,
      badge: `${stats.totalAssignedStudents} Day Scholars`,
      color: "text-purple-600 bg-purple-100 dark:bg-purple-950/40",
    },
    {
      title: "Driver Complaints",
      desc: "Driver vehicle breakdown reports, engine alerts, and resolution status.",
      href: "/bus/complaints",
      icon: AlertTriangle,
      badge: `${stats.pendingComplaintsCount} Pending`,
      color: "text-amber-600 bg-amber-100 dark:bg-amber-950/40",
    },
    {
      title: "Analytics & Data Export",
      desc: "Transport capacity metrics, breakdown logs, and CSV data export.",
      href: "/bus/analytics",
      icon: BarChart3,
      badge: "CSV Export",
      color: "text-cyan-600 bg-cyan-100 dark:bg-cyan-950/40",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bus Transport Administration"
        description="Full administrative controls over campus shuttle fleet, routes, stops, driver allocations, and breakdown reports."
      />

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider">Total Bus Fleet</CardDescription>
            <CardTitle className="text-3xl font-black text-foreground flex items-center gap-2">
              <Bus className="w-6 h-6 text-primary" /> {stats.totalBuses}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {stats.activeBuses} Active, {stats.maintenanceBuses} Maintenance, {stats.breakdownBuses} Breakdown
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider">Driver Allocations</CardDescription>
            <CardTitle className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {stats.assignedDrivers} / {stats.totalDrivers}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {stats.unassignedDrivers} unassigned drivers available
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider">Capacity Utilization</CardDescription>
            <CardTitle className="text-3xl font-black text-foreground">
              {stats.capacityUtilization}%
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {stats.totalAssignedStudents} Day Scholar seats filled out of {stats.totalCapacity}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider">Pending Breakdown Complaints</CardDescription>
            <CardTitle className="text-3xl font-black text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-500" /> {stats.pendingComplaintsCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {stats.resolvedComplaintsCount} resolved driver complaints
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickModules.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.title} className="hover:border-primary/40 transition-all flex flex-col justify-between group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className="text-xs font-mono">{m.badge}</Badge>
                </div>
                <CardTitle className="text-lg font-bold text-foreground mt-3 group-hover:text-primary transition-colors">
                  {m.title}
                </CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  {m.desc}
                </CardDescription>
              </CardHeader>
                <Link href={m.href} className="inline-flex items-center justify-center w-full px-3 py-2 text-xs font-semibold rounded-lg border bg-background hover:bg-accent text-foreground transition-colors gap-1">
                  Open Module <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
