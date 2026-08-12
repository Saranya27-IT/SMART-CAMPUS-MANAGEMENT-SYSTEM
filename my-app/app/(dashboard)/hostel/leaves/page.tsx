import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth";
import { getLeaveRequests, getStudentHostelOverview } from "@/lib/actions/hostel";
import { PageHeader } from "@/components/common/PageHeader";
import { HostelLeavesClient } from "@/components/hostel/HostelLeavesClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hostel Leave Requests — Smart Campus",
  description: "Manage hostel leave applications and warden authorizations.",
};

export default async function HostelLeavesPage() {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");

  const isWarden = profile.role === "hostel_warden" || profile.role === "super_admin";
  const { data: leaves } = await getLeaveRequests();

  let userHostelId: string | undefined = undefined;
  if (profile.role === "student") {
    const overview = await getStudentHostelOverview();
    if (overview.isDayScholar) {
      redirect("/hostel");
    }
    userHostelId = overview.data?.allocation?.hostel_id;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hostel Leave Requests"
        description="Submit leave requests, track approval status, and process warden approvals/rejections."
      />
      <HostelLeavesClient
        leaves={leaves || []}
        isWarden={isWarden}
        userHostelId={userHostelId}
      />
    </div>
  );
}
