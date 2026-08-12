import { getCurrentUser } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { getEvents } from "@/lib/actions/events";
import { CheckInClient } from "./CheckInClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event QR Check-in — Smart Campus",
  description: "Scan and verify participant attendance at campus events.",
};

export default async function EventCheckInPage() {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");

  // Only organizers and admins can check in
  if (profile.role !== "event_organizer" && profile.role !== "super_admin") {
    redirect("/events");
  }

  // Get active events (ongoing + upcoming)
  const { data: allEvents } = await getEvents();
  const activeEvents = (allEvents ?? []).filter(
    (e: any) => e.status === "ongoing" || e.status === "upcoming"
  );

  return <CheckInClient events={activeEvents} userRole={profile.role} />;
}
