import { redirect } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { getCategories } from "@/lib/actions/library";
import { getCurrentUser } from "@/lib/actions/auth";
import { CategoriesTable } from "./CategoriesTable";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories — Library | Smart Campus",
  description: "Browse and manage book categories in the campus library.",
};

export default async function CategoriesPage() {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");

  const isLibrarian = profile.role === "librarian" || profile.role === "super_admin";
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <PageHeader title="Categories" description="Organize and classify library catalogue subjects and genres." />
      <CategoriesTable categories={categories} isLibrarian={isLibrarian} />
    </div>
  );
}
