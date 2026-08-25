import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/actions/auth";
import { PageHeader } from "@/components/common/PageHeader";
import { EventsNav } from "@/components/events/EventsNav";
import { EventCertificatesClient } from "@/components/events/EventCertificatesClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Digital Certificates — Events",
  description: "Verified participation and completion certificates.",
};

export default async function EventCertificatesPage() {
  const profile = await getCurrentUser();
  const supabase = await createClient();

  const { data: certificatesData } = await supabase
    .from("event_registrations")
    .select(`*, events(title, start_time, end_time, venue)`)
    .eq("user_id", profile?.id || "")
    .eq("attended", true)
    .order("registered_at", { ascending: false });

  const certificates = (certificatesData ?? []) as any[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Digital Event Certificates"
        description="Verified participation and completion certificates."
      />
      <EventsNav role={profile?.role} />

      <EventCertificatesClient
        certificates={certificates}
        recipientName={profile?.full_name || "Student"}
        recipientId={profile?.roll_number || profile?.employee_id || undefined}
        department={profile?.department || undefined}
      />
    </div>
  );
}
