import { redirect } from "next/navigation";
import { getBorrows } from "@/lib/actions/library";
import { PageHeader } from "@/components/common/PageHeader";
import { BorrowsTable } from "./BorrowsTable";
import type { Metadata } from "next";

import { getCurrentUser } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "Borrows — Library | Smart Campus",
};

export default async function BorrowsPage() {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");

  const isLibrarian = profile.role === "librarian" || profile.role === "super_admin";
  const isStudent = profile.role === "student";

  const { data: borrowsData } = await getBorrows(isStudent ? profile.id : undefined);
  const borrows = (borrowsData ?? []) as any[];

  return (
    <div className="space-y-6">
      <PageHeader
        title={isStudent ? "My Borrows" : "All Borrows"}
        description={isStudent ? "Track your borrowed books, due dates, and fines." : "Manage all library borrows."}
      />
      <BorrowsTable borrows={borrows} isLibrarian={isLibrarian} />
    </div>
  );
}
