import { getCategories } from "@/lib/actions/library";
import { PageHeader } from "@/components/common/PageHeader";
import { CategoriesTable } from "./CategoriesTable";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Categories — Library",
};

export default async function BookCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Book Categories"
        description="Organize catalogue items by domain and genre."
      />
      <CategoriesTable categories={categories} />
    </div>
  );
}
