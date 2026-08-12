import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { getCategories, getAuthors, getPublishers } from "@/lib/actions/library";
import { getCurrentUser } from "@/lib/actions/auth";
import { NewBookForm } from "./NewBookForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add New Book — Library | Smart Campus",
};

export default async function NewBookPage() {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");

  const isLibrarian = profile.role === "librarian" || profile.role === "super_admin";
  if (!isLibrarian) {
    redirect("/library/books");
  }

  const [categories, authors, publishers] = await Promise.all([
    getCategories(),
    getAuthors(),
    getPublishers(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Book"
        description="Add a new book to the campus library system."
        actions={
          <Link href="/library/books">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Books
            </Button>
          </Link>
        }
      />
      <NewBookForm
        categories={categories}
        authors={authors}
        publishers={publishers}
      />
    </div>
  );
}
