import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/common/PageHeader";
import { getBorrows, getBooks, getBookCopies } from "@/lib/actions/library";
import { getCurrentUser } from "@/lib/actions/auth";
import { BorrowsTable } from "./BorrowsTable";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Borrows & Issue — Library | Smart Campus",
  description: "Manage book issuing, returning, renewals, and loan history.",
};

export default async function BorrowsPage() {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");

  const isLibrarian = profile.role === "librarian" || profile.role === "super_admin";
  const supabase = await createClient();

  const [{ data: borrows }, { data: booksData }, { data: copiesData }, { data: profilesData }] = await Promise.all([
    getBorrows(),
    getBooks(),
    getBookCopies(),
    supabase.from("profiles").select("id, full_name, roll_number, email, role").in("role", ["student", "faculty"]).order("full_name"),
  ]);

  const books = (booksData ?? []).map((b: any) => ({
    id: b.id,
    title: b.title,
    available_copies: b.available_copies ?? 0,
  }));

  const copies = (copiesData ?? []).map((c: any) => ({
    id: c.id,
    book_id: c.book_id,
    copy_number: c.copy_number,
    status: c.status,
  }));

  const profiles = (profilesData ?? []) as any[];

  return (
    <div className="space-y-6">
      <PageHeader
        title={isLibrarian ? "Library Loans & Issue Management" : "My Borrowing History"}
        description={
          isLibrarian
            ? "Issue books to students/faculty, process returns, extend due dates, and monitor loans."
            : "Track your active loans, due dates, renewal limits, and past returned books."
        }
      />
      <BorrowsTable
        borrows={borrows ?? []}
        profiles={profiles}
        books={books}
        copies={copies}
        isLibrarian={isLibrarian}
      />
    </div>
  );
}
