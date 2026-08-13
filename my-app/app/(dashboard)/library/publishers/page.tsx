import { redirect } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { getPublishers } from "@/lib/actions/library";
import { getCurrentUser } from "@/lib/actions/auth";
import { PublishersTable } from "./PublishersTable";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Publishers — Library | Smart Campus",
  description: "Browse and manage book publishers in the campus library.",
};

export default async function PublishersPage() {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");

  const isLibrarian = profile.role === "librarian" || profile.role === "super_admin";
  const publishers = await getPublishers();

  return (
    <div className="space-y-6">
      <PageHeader title="Publishers" description="View and manage publishing partners and publication details." />
      <PublishersTable publishers={publishers} isLibrarian={isLibrarian} />
    </div>
  );
}
