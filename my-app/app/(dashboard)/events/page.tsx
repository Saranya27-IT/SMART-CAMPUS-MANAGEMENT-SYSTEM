import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getEvents, getEventCategories } from "@/lib/actions/events";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/constants";
import { format } from "date-fns";
import type { Metadata } from "next";

import { getCurrentUser } from "@/lib/actions/auth";

import { EventsNav } from "@/components/events/EventsNav";

export const metadata: Metadata = {
  title: "Events — Smart Campus",
  description: "Browse and register for campus events.",
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
        title="Campus Events"
        description="Register for workshops, seminars, cultural events, and more."
        actions={
          isOrganizer ? (
            <Link href="/events/manage">
              <Button className="gradient-primary text-white border-0 hover:opacity-90" id="manage-events-btn">
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </Link>
          ) : null
        }
      />

      <EventsNav role={profile.role} />

      {!events || events.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No events yet</p>
          <p className="text-sm">Check back later for upcoming events.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.map((event) => {
            const isRegistered = registeredEventIds.has(event.id);
            const isFull = false; // Can add capacity check here
            const isPast = event.status === "completed" || event.status === "cancelled";
            const category = event.event_categories as unknown as { name: string; color: string } | null;
            return (
              <Card key={event.id} className="flex flex-col overflow-hidden hover:shadow-md transition-shadow border">
                {/* Banner */}
                <div
                  className="h-40 gradient-campus flex items-center justify-center relative"
                  style={event.banner_url ? { backgroundImage: `url(${event.banner_url})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
                >
                  {!event.banner_url && (
                    <Calendar className="h-12 w-12 text-white/40" />
                  )}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge className={cn("border text-xs", STATUS_COLORS[event.status])}>
                      {event.status}
                    </Badge>
                    {category && (
                      <Badge
                        className="border text-xs text-white"
                        style={{ backgroundColor: category.color ?? "#6366F1", borderColor: "transparent" }}
                      >
                        {category.name}
                      </Badge>
                    )}
                  </div>
                  {isRegistered && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-emerald-500 text-white border-0 text-xs">✓ Registered</Badge>
                    </div>
                  )}
                </div>

                <CardContent className="flex-1 pt-4 pb-2 space-y-3">
                  <h3 className="font-semibold text-base leading-tight line-clamp-2">{event.title}</h3>
                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{format(new Date(event.start_time), "d MMM yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{format(new Date(event.start_time), "h:mm a")} – {format(new Date(event.end_time), "h:mm a")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>Capacity: {event.capacity}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-0 pb-4 px-6">
                  <Link href={`/events/${event.id}`} className="w-full">
                    <Button
                      className="w-full"
                      variant={isRegistered ? "outline" : "default"}
                      disabled={isPast}
                    >
                      {isRegistered ? "View Details" : isPast ? "Event Ended" : "Register / View"}
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
