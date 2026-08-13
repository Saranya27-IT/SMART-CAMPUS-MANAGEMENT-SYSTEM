import { redirect } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { getBookCopies, getBooks } from "@/lib/actions/library";
import { getCurrentUser } from "@/lib/actions/auth";
import { BookCopiesTable } from "./BookCopiesTable";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Copies — Library | Smart Campus",
  description: "Track physical book copies, accession numbers, and availability statuses.",
};

export default async function BookCopiesPage() {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");

  const isLibrarian = profile.role === "librarian" || profile.role === "super_admin";
  const { data: copies } = await getBookCopies();
  const { data: books } = await getBooks();

  const formattedBooks = (books ?? []).map((b: any) => ({ id: b.id, title: b.title }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Physical Book Copies"
        description="Monitor physical accession barcodes, QR tokens, condition, and shelf availability."
      />
      <BookCopiesTable copies={copies ?? []} books={formattedBooks} isLibrarian={isLibrarian} />
    </div>
  );
}
