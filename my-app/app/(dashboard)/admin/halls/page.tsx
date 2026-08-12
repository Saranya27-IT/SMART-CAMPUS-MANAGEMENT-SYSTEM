import { getCurrentUser } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import { getHalls } from "@/lib/actions/events";
import { PageHeader } from "@/components/common/PageHeader";
import { HallsClient } from "./HallsClient";
import type { Metadata } from "next";

import { EventsNav } from "@/components/events/EventsNav";

export const metadata: Metadata = {
  title: "Hall Management — Smart Campus Admin",
  description: "Create and manage event venue halls.",
};

export default async function AdminHallsPage() {
  const profile = await getCurrentUser();
  if (!profile || profile.role !== "super_admin") redirect("/dashboard");

  const { data: halls } = await getHalls();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hall Management"
        description="Create and manage campus event halls and venues."
      />
      <EventsNav role={profile.role} />
      <HallsClient halls={(halls ?? []) as any[]} />
    </div>
  );
}
