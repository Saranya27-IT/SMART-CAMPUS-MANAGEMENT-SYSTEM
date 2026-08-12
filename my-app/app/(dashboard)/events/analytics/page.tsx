import { getCurrentUser } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { getEventStats } from "@/lib/actions/events";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays, Users, CheckCircle, TrendingUp,
  Clock, XCircle, BarChart3, Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/constants";
import { format } from "date-fns";
import type { Metadata } from "next";

import { EventsNav } from "@/components/events/EventsNav";

export const metadata: Metadata = {
  title: "Event Analytics — Smart Campus",
  description: "Event participation metrics, registration trends, and category breakdowns.",
};

export default async function EventAnalyticsPage() {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");

  const stats = await getEventStats();

  const statusBreakdown = [
    { label: "Upcoming",  value: stats.upcomingEvents,  color: "bg-blue-500",   badgeClass: STATUS_COLORS["upcoming"] },
    { label: "Ongoing",   value: stats.ongoingEvents,   color: "bg-emerald-500", badgeClass: STATUS_COLORS["ongoing"] },
    { label: "Completed", value: stats.completedEvents, color: "bg-violet-500",  badgeClass: STATUS_COLORS["completed"] },
  ];
  const maxStatus = Math.max(...statusBreakdown.map((s) => s.value), 1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Event Participation Analytics"
        description="Registration volumes, attendance rates, and category breakdowns."
      />
      <EventsNav role={profile.role} />

      {/* Top stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Events"        value={stats.totalEvents}        icon={CalendarDays} color="indigo" />
        <StatCard title="Total Registrations" value={stats.totalRegistrations} icon={Users}        color="amber" />
        <StatCard title="Total Attended"      value={stats.totalAttended}      icon={CheckCircle}  color="emerald"
          subtitle={`${stats.attendanceRate}% attendance rate`} />
        <StatCard title="Upcoming Events"     value={stats.upcomingEvents}     icon={TrendingUp}   color="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events by status */}
        <Card className="border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Events by Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {statusBreakdown.map((s) => (
              <div key={s.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn("text-xs capitalize", s.badgeClass)}>
                      {s.label}
                    </Badge>
                  </div>
                  <span className="font-semibold tabular-nums">{s.value}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700", s.color)}
                    style={{ width: `${Math.round((s.value / maxStatus) * 100)}%` }}
                  />
                </div>
              </div>
            ))}

            {/* Attendance rate donut-style */}
            <div className="mt-2 pt-4 border-t">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Overall Attendance Rate</span>
                <span className="font-bold text-foreground">{stats.attendanceRate}%</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                  style={{ width: `${stats.attendanceRate}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{stats.totalAttended} attended</span>
                <span>{stats.totalRegistrations} registered</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category breakdown */}
        <Card className="border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" />
              Events by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.categoryBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No category data yet</p>
            ) : (
              <div className="space-y-3">
                {stats.categoryBreakdown.map((cat) => {
                  const maxCat = Math.max(...stats.categoryBreakdown.map((c) => c.count), 1);
                  return (
                    <div key={cat.name} className="flex items-center gap-3">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-medium truncate">{cat.name}</span>
                          <span className="text-muted-foreground ml-2 tabular-nums">{cat.count}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${Math.round((cat.count / maxCat) * 100)}%`,
                              backgroundColor: cat.color,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top events */}
      {stats.topEvents.length > 0 && (
        <Card className="border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              Recent Events
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {stats.topEvents.map((event: any) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between px-6 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(event.start_time), "d MMM yyyy")}
                    </p>
                  </div>
                  <Badge variant="outline" className={cn("text-xs capitalize ml-4", STATUS_COLORS[event.status])}>
                    {event.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
