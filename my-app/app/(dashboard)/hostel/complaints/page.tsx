import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth";
import { getHostelComplaints, getStudentHostelOverview } from "@/lib/actions/hostel";
import { PageHeader } from "@/components/common/PageHeader";
import { HostelComplaintsClient } from "@/components/hostel/HostelComplaintsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hostel Complaints — Smart Campus",
  description: "Track and resolve hostel maintenance and cleanliness complaints.",
};

export default async function HostelComplaintsPage() {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");

  const isWarden = profile.role === "hostel_warden" || profile.role === "super_admin";
  const { data: complaints } = await getHostelComplaints();

  let userHostelId: string | undefined = undefined;
  if (profile.role === "student") {
    const overview = await getStudentHostelOverview();
    if (overview.isDayScholar) redirect("/hostel");
    userHostelId = overview.data?.allocation?.hostel_id;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hostel Complaints"
        description="Report and track room, maintenance, cleanliness, or safety complaints."
      />
      <HostelComplaintsClient
        complaints={complaints || []}
        isWarden={isWarden}
        userHostelId={userHostelId}
      />
    </div>
  );
}
