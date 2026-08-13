import { redirect } from "next/navigation";
import { getLibraryAnalytics } from "@/lib/actions/library";
import { PageHeader } from "@/components/common/PageHeader";
import { getCurrentUser } from "@/lib/actions/auth";
import { LibraryAnalyticsClient } from "./LibraryAnalyticsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Library Analytics — Smart Campus",
  description: "Circulation metrics, category breakdowns, and physical inventory analytics.",
};

export default async function LibraryAnalyticsPage() {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");

  const analytics = await getLibraryAnalytics();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Library Analytics & Intelligence"
        description="Comprehensive circulation data, category distribution, loan ratios, and fee collection."
      />
      <LibraryAnalyticsClient analytics={analytics} />
    </div>
  );
}
