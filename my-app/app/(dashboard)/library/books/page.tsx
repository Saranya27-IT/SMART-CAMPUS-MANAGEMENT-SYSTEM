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
  title: "Books — Library | Smart Campus",
};

export default async function BooksPage() {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");

  const isLibrarian = profile.role === "librarian" || profile.role === "super_admin";
  const supabase = await createClient();

  const { data: booksData } = await supabase
    .from("books")
    .select(`*, book_categories(name), book_authors(name)`)
    .order("title", { ascending: true });

  const books = (booksData ?? []) as any[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Books"
        description="Browse and manage the library catalogue."
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
      <BooksTable books={books} isLibrarian={isLibrarian} />
    </div>
  );
}
