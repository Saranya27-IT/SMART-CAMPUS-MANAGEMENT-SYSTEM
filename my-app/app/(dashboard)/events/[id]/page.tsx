import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/actions/auth";
import { getEvent, getMyRegistration, getEventRegistrations } from "@/lib/actions/events";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar, Clock, MapPin, Users, ArrowLeft, Building2,
  Award, QrCode, CheckCircle2, UserCheck, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/constants";
import { format } from "date-fns";
import type { Metadata } from "next";
import { EventDetailActions } from "@/components/events/EventDetailActions";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data: event } = await getEvent(params.id);
  return {
    title: event ? `${event.title} — Smart Campus Events` : "Event — Smart Campus",
    description: event?.description ?? "",
  };
}

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");

  const [{ data: event }, { data: myReg }] = await Promise.all([
    getEvent(params.id),
    getMyRegistration(params.id),
  ]);

  if (!event) notFound();

  const isOrganizer =
    profile.role === "super_admin" ||
    profile.role === "event_organizer";
  const isRegistered = !!myReg;
  const isPast = event.status === "completed" || event.status === "cancelled";
  const isOngoing = event.status === "ongoing";
  const isFull = false; // computed below
  const deadlinePassed =
    event.registration_deadline && new Date(event.registration_deadline) < new Date();

  const category = event.event_categories as { name: string; color: string } | null;
  const hall = event.event_halls as { name: string; location: string; capacity: number } | null;
  const organizer = event.profiles as { full_name: string; email: string } | null;

  // Registration count
  const supabase = await createClient();
  const { count: regCount } = await supabase
    .from("event_registrations")
    .select("*", { count: "exact", head: true })
    .eq("event_id", event.id);
  const registeredCount = regCount ?? 0;
  const capacityPct = Math.min(100, Math.round((registeredCount / event.capacity) * 100));
  const isFull2 = registeredCount >= event.capacity;

  // Attendee list (for organizers)
  let registrations: any[] = [];
  if (isOrganizer) {
    const { data } = await getEventRegistrations(params.id);
    registrations = data ?? [];
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back */}
      <Link href="/events" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Events
      </Link>

      {/* Hero banner */}
      <div
        className="rounded-2xl overflow-hidden h-52 gradient-campus flex items-end relative"
        style={event.banner_url ? { backgroundImage: `url(${event.banner_url})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="relative p-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 w-full">
          <div className="flex flex-wrap gap-2">
            <Badge className={cn("border text-xs capitalize", STATUS_COLORS[event.status])}>
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-5">
          <div>
            <h1 className="text-2xl font-bold text-foreground leading-tight">{event.title}</h1>
            {organizer && (
              <p className="text-sm text-muted-foreground mt-1">
                Organized by <span className="font-medium text-foreground">{organizer.full_name}</span>
              </p>
            )}
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
              <Calendar className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">Date</p>
                <p className="text-muted-foreground">{format(new Date(event.start_time), "EEEE, d MMM yyyy")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
              <Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">Time</p>
                <p className="text-muted-foreground">
                  {format(new Date(event.start_time), "h:mm a")} – {format(new Date(event.end_time), "h:mm a")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
              <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">Venue</p>
                <p className="text-muted-foreground">{event.venue}</p>
              </div>
            </div>
            {hall && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                <Building2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Hall</p>
                  <p className="text-muted-foreground">{hall.name}</p>
                  <p className="text-xs text-muted-foreground/70">{hall.location}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
              <Users className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">Capacity</p>
                <p className="text-muted-foreground">{registeredCount} / {event.capacity} registered</p>
              </div>
            </div>
            {event.registration_deadline && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                <AlertCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Registration Deadline</p>
                  <p className={cn("text-muted-foreground", deadlinePassed && "text-rose-600")}>
                    {format(new Date(event.registration_deadline), "d MMM yyyy, h:mm a")}
                    {deadlinePassed && " (Closed)"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Capacity bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{registeredCount} registered</span>
              <span>{event.capacity - registeredCount} spots left</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  capacityPct >= 90 ? "bg-rose-500" : capacityPct >= 70 ? "bg-amber-500" : "bg-emerald-500"
                )}
                style={{ width: `${capacityPct}%` }}
              />
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <Card className="border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">About this Event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Organizer attendee list */}
          {isOrganizer && registrations.length > 0 && (
            <Card className="border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-primary" />
                  Attendees ({registrations.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {registrations.slice(0, 10).map((reg: any) => {
                    const p = reg.profiles;
                    return (
                      <div key={reg.id} className="flex items-center justify-between px-6 py-3 hover:bg-muted/30 transition-colors">
                        <div>
                          <p className="text-sm font-medium">{p?.full_name}</p>
                          <p className="text-xs text-muted-foreground">{p?.roll_number ?? p?.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn("text-xs capitalize", reg.attended
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-gray-50 text-gray-600 border-gray-200"
                            )}
                          >
                            {reg.attended ? "✓ Attended" : "Registered"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {registrations.length > 10 && (
                  <p className="text-xs text-muted-foreground text-center py-3">
                    +{registrations.length - 10} more participants
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar: Registration / QR */}
        <div className="space-y-4">
          <Card className="border sticky top-6">
            <CardContent className="pt-6 space-y-4">
              {/* Registration CTA */}
              <EventDetailActions
                eventId={event.id}
                isRegistered={isRegistered}
                isPast={isPast}
                isOngoing={isOngoing}
                isFull={isFull2}
                deadlinePassed={!!deadlinePassed}
                isOrganizer={isOrganizer}
                myQrCode={myReg?.qr_code ?? null}
                myAttended={myReg?.attended ?? false}
                myCertificateIssued={myReg?.certificate_issued ?? false}
              />

              {/* Certificates */}
              {myReg?.attended && (
                <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-center">
                  <Award className="h-6 w-6 text-amber-600 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-amber-800">Certificate Eligible</p>
                  <p className="text-xs text-amber-700 mt-0.5">You attended this event</p>
                  <Link href="/events/certificates">
                    <Button variant="outline" size="sm" className="w-full mt-2 text-xs border-amber-300 text-amber-700 hover:bg-amber-100">
                      View Certificates
                    </Button>
                  </Link>
                </div>
              )}

              {/* Organizer links */}
              {isOrganizer && (
                <div className="space-y-2 border-t pt-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Organizer Tools</p>
                  <Link href={`/events/manage`}>
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      Edit Event
                    </Button>
                  </Link>
                  <Link href={`/events/check-in`}>
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      <QrCode className="mr-2 h-3.5 w-3.5" />
                      QR Check-in
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
