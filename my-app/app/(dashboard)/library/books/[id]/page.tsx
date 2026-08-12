import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { getBook } from "@/lib/actions/library";
import { getCurrentUser } from "@/lib/actions/auth";
import { BookDetailsClient } from "./BookDetailsClient";
import type { Metadata } from "next";

interface BookDetailsPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: BookDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const { data: book } = await getBook(id);
  return {
    title: book ? `${book.title} — Library` : "Book Details",
  };
}

export default async function BookDetailsPage({ params }: BookDetailsPageProps) {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");

  const { id } = await params;
  const { data: book, error } = await getBook(id);

  if (error || !book) {
    notFound();
  }

  const isLibrarian = profile.role === "librarian" || profile.role === "super_admin";

  return (
    <div className="space-y-6">
      <PageHeader
        title={book.title}
        description={`Library catalogue item details`}
        actions={
          <Link href="/library/books">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Books
            </Button>
          </Link>
        }
      />
      <BookDetailsClient book={book} isLibrarian={isLibrarian} />
    </div>
  );
}
