import { getEvents, getEventCategories, getHalls } from "@/lib/actions/events";
import { getCurrentUser } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { ManageEventsClient } from "./ManageEventsClient";
import type { Metadata } from "next";

import { EventsNav } from "@/components/events/EventsNav";

export const metadata: Metadata = {
  title: "Manage Events — Smart Campus",
  description: "Create and manage campus events.",
};

export default async function EventManagePage() {
  const profile = await getCurrentUser();
  if (!profile || (profile.role !== "event_organizer" && profile.role !== "super_admin")) {
    redirect("/events");
  }

  const [{ data: events }, categories, { data: halls }] = await Promise.all([
    getEvents(),
    getEventCategories(),
    getHalls(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Events"
        description="Create, edit, and oversee campus event programs."
      />
      <EventsNav role={profile.role} />
      <ManageEventsClient
        events={(events ?? []) as any[]}
        categories={(categories ?? []) as any[]}
        halls={(halls ?? []) as any[]}
        isAdmin={profile.role === "super_admin"}
      />
    </div>
  );
}
