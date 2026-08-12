import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/actions/auth";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Download } from "lucide-react";
import type { Metadata } from "next";

import { EventsNav } from "@/components/events/EventsNav";

export const metadata: Metadata = {
  title: "Digital Certificates — Events",
};

export default async function EventCertificatesPage() {
  const profile = await getCurrentUser();
  const supabase = await createClient();

  const { data: certificatesData } = await supabase
    .from("event_registrations")
    .select(`*, events(title, start_time, venue)`)
    .eq("user_id", profile?.id || "")
    .eq("attended", true);

  const certificates = (certificatesData ?? []) as any[];

  type CertRow = NonNullable<typeof certificates>[number] & {
    events?: { title: string; start_time: string; venue: string };
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Digital Event Certificates"
        description="Verified participation and completion certificates."
      />
      <EventsNav role={profile?.role} />

      {!certificates || certificates.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No certificates earned yet.</p>
            <p className="text-sm">Attend registered events to earn digital certificates.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert: CertRow) => (
            <Card key={cert.id} className="border bg-card">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs mb-1">Verified Certificate</Badge>
                    <h4 className="font-bold text-base">{cert.events?.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Participant: {profile?.full_name}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <Download className="mr-2 h-3.5 w-3.5" />
                  Download Certificate (PDF)
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
