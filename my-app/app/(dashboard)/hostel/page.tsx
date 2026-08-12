import { redirect } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { getCurrentUser } from "@/lib/actions/auth";
import { getStudentHostelOverview } from "@/lib/actions/hostel";
import { StudentHostelClient } from "@/components/hostel/StudentHostelClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hostel — Smart Campus",
  description: "View room allocation, submit leave requests, and manage hostel services.",
};

export default async function HostelPage() {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");

  const isWarden = profile.role === "hostel_warden" || profile.role === "super_admin";
  if (isWarden) redirect("/hostel/manage");

  const overview = await getStudentHostelOverview();

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Hostel Services"
        description="View room details, submit leave applications, track complaints, and view fee status."
      />
      <StudentHostelClient overviewData={overview} />
    </div>
  );
}
