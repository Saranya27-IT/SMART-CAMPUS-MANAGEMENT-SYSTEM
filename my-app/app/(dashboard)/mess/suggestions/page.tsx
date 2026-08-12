import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth";
import { getMessSuggestions } from "@/lib/actions/mess";
import { PageHeader } from "@/components/common/PageHeader";
import { MessSuggestionsClient } from "@/components/mess/MessSuggestionsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Food Suggestions — Mess Management",
  description: "Student dish suggestions and menu improvement feedback.",
};

export default async function MessSuggestionsPage() {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");

  const isManager = profile.role === "mess_manager" || profile.role === "super_admin";
  const { data: suggestions } = await getMessSuggestions();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mess Dish Suggestions"
        description="Student dish suggestions, menu improvement recommendations, and manager review statuses."
      />
      <MessSuggestionsClient
        suggestions={suggestions || []}
        isManager={isManager}
      />
    </div>
  );
}
