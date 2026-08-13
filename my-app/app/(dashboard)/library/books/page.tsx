import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { BooksTable } from "./BooksTable";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "Books Catalogue — Library | Smart Campus",
  description: "Browse, filter, and manage library books and physical availability.",
};

export default async function BooksPage() {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");

  const isLibrarian = profile.role === "librarian" || profile.role === "super_admin";
  const supabase = await createClient();

  const [
    { data: booksData },
    { data: categoriesData },
    { data: authorsData },
  ] = await Promise.all([
    supabase
      .from("books")
      .select(`*, book_categories(id, name), book_authors(id, name), book_publishers(id, name)`)
      .order("title", { ascending: true }),
    supabase.from("book_categories").select("id, name").order("name"),
    supabase.from("book_authors").select("id, name").order("name"),
  ]);

  const books = (booksData ?? []) as any[];
  const categories = (categoriesData ?? []) as any[];
  const authors = (authorsData ?? []) as any[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Books Catalogue"
        description="Search, filter, and inspect physical copy availability in the campus library."
        actions={
          isLibrarian ? (
            <Link href="/library/books/new">
              <Button className="gradient-primary text-white border-0 hover:opacity-90" id="add-book-link-btn">
                <Plus className="mr-2 h-4 w-4" />
                Add Book
              </Button>
            </Link>
          ) : null
        }
      />
      <BooksTable books={books} categories={categories} authors={authors} isLibrarian={isLibrarian} />
    </div>
  );
}
