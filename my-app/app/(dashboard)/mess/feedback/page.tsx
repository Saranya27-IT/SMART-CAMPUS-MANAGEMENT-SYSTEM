import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth";
import { getFeedback, getMessRatingOverview } from "@/lib/actions/mess";
import { PageHeader } from "@/components/common/PageHeader";
import { MessFeedbackClient } from "@/components/mess/MessFeedbackClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meal Ratings & Feedback — Mess Management",
  description: "Inspect student meal ratings, star distributions, and meal quality feedback.",
};

export default async function MessFeedbackPage() {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");

  const [feedbackRes, overviewRes] = await Promise.all([
    getFeedback(),
    getMessRatingOverview(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mess Meal Ratings & Feedback"
        description="Inspect student meal ratings, star distribution, highest & lowest rated meals, and quality comments."
      />
      <MessFeedbackClient
        feedbackList={feedbackRes.data || []}
        overview={overviewRes}
      />
    </div>
  );
}
