import { redirect } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { getAuthors } from "@/lib/actions/library";
import { getCurrentUser } from "@/lib/actions/auth";
import { AuthorsTable } from "./AuthorsTable";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authors — Library | Smart Campus",
  description: "Browse and manage book authors in the library.",
};

export default async function AuthorsPage() {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");

  const isLibrarian = profile.role === "librarian" || profile.role === "super_admin";
  const authors = await getAuthors();

  return (
    <div className="space-y-6">
      <PageHeader title="Authors" description="View and manage library book authors and biographical records." />
      <AuthorsTable authors={authors} isLibrarian={isLibrarian} />
    </div>
  );
}
