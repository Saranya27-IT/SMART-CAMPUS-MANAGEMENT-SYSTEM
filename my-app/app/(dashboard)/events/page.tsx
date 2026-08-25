import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getEvents, getEventCategories } from "@/lib/actions/events";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, Plus, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/constants";
import { format } from "date-fns";
import type { Metadata } from "next";

import { getCurrentUser } from "@/lib/actions/auth";
import { EventsNav } from "@/components/events/EventsNav";

export const metadata: Metadata = {
  title: "Events — Smart Campus",
  description: "Browse, register, and check into campus workshops, seminars, and cultural festivals.",
};

export default async function EventsPage() {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");

  const isOrganizer = profile.role === "event_organizer" || profile.role === "super_admin";
  const supabase = await createClient();

  const [{ data: eventsData }, { data: myRegistrations }] = await Promise.all([
    getEvents(),
    supabase.from("event_registrations").select("event_id").eq("user_id", profile.id),
  ]);

  const events = (eventsData ?? []) as any[];
  const registeredEventIds = new Set(((myRegistrations as any[]) ?? []).map((r) => r.event_id));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campus Events & Workshops"
        description="Discover academic seminars, technical symposiums, hackathons, and cultural fests."
        badge="Events"
        badgeColor="bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800"
        actions={
          isOrganizer ? (
            <Link href="/events/manage">
              <Button className="gradient-events text-white border-0 hover:opacity-90 shadow-md font-semibold gap-1.5" id="manage-events-btn">
                <Plus className="h-4 w-4" />
                Create New Event
              </Button>
            </Link>
          ) : null
        }
      />

      <EventsNav role={profile.role} />

      {!events || events.length === 0 ? (
        <Card className="border-dashed border-2 py-16 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 flex items-center justify-center mx-auto">
            <Calendar className="h-7 w-7" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground">No events scheduled</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
              Check back soon or explore past certified event records.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.map((event) => {
            const isRegistered = registeredEventIds.has(event.id);
            const isPast = event.status === "completed" || event.status === "cancelled";
            const category = event.event_categories as unknown as { name: string; color: string } | null;

            return (
              <Card
                key={event.id}
                className="group flex flex-col overflow-hidden rounded-2xl border bg-card hover:border-pink-300 dark:hover:border-pink-700/60 hover:shadow-md transition-all duration-200"
              >
                {/* Banner / Poster Header */}
                <div
                  className="h-44 relative bg-gradient-to-br from-pink-950/80 via-purple-950/70 to-slate-950 flex items-center justify-center overflow-hidden"
                  style={
                    event.banner_url
                      ? { backgroundImage: `url(${event.banner_url})`, backgroundSize: "cover", backgroundPosition: "center" }
                      : {}
                  }
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {!event.banner_url && (
                    <div className="relative z-10 w-12 h-12 rounded-2xl gradient-events flex items-center justify-center text-white shadow-lg">
                      <Sparkles className="h-6 w-6" />
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                    <Badge className={cn("text-xs font-semibold uppercase tracking-wider backdrop-blur-md shadow-xs", STATUS_COLORS[event.status])}>
                      {event.status}
                    </Badge>
                    {isRegistered && (
                      <Badge className="bg-emerald-600 text-white border-0 text-xs font-semibold shadow-xs">
                        ✓ Registered
                      </Badge>
                    )}
                  </div>

                  {/* Category Pill */}
                  {category && (
                    <div className="absolute bottom-3 left-3 z-10">
                      <Badge
                        className="text-xs text-white font-medium border-0 shadow-xs"
                        style={{ backgroundColor: category.color ?? "#ec4899" }}
                      >
                        {category.name}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Event Details */}
                <CardContent className="flex-1 p-5 space-y-3.5">
                  <h3 className="font-bold text-base leading-snug line-clamp-2 text-foreground group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                    {event.title}
                  </h3>

                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-pink-500 flex-shrink-0" />
                      <span className="font-medium text-foreground">{format(new Date(event.start_time), "EEEE, d MMMM yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-purple-500 flex-shrink-0" />
                      <span>{format(new Date(event.start_time), "h:mm a")} – {format(new Date(event.end_time), "h:mm a")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-rose-500 flex-shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                      <span>Max Capacity: <strong>{event.capacity} Seats</strong></span>
                    </div>
                  </div>
                </CardContent>

                {/* Footer Action */}
                <CardFooter className="pt-0 pb-5 px-5">
                  <Link href={`/events/${event.id}`} className="w-full">
                    <Button
                      className={cn(
                        "w-full rounded-xl text-xs font-bold gap-1.5 h-10 transition-all",
                        isRegistered
                          ? "border-pink-200 bg-pink-50/50 text-pink-700 hover:bg-pink-100 dark:bg-pink-950/20 dark:text-pink-300 dark:border-pink-800"
                          : isPast
                          ? "opacity-60 cursor-not-allowed"
                          : "gradient-events text-white border-0 shadow-sm hover:opacity-95"
                      )}
                      variant={isRegistered ? "outline" : "default"}
                      disabled={isPast}
                    >
                      {isRegistered ? "View Registration & Passes" : isPast ? "Event Concluded" : "Register Now"}
                      {!isPast && <ArrowRight className="h-3.5 w-3.5" />}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
