import { getCurrentUser } from "@/lib/actions/auth";
import { getBorrows } from "@/lib/actions/library";
import { PageHeader } from "@/components/common/PageHeader";
import { LibraryFinesTable } from "./LibraryFinesTable";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fines & Payments — Library",
};

export default async function LibraryFinesPage() {
  const profile = await getCurrentUser();
  const isLibrarian = profile?.role === "librarian" || profile?.role === "super_admin";

  const { data: allBorrows } = await getBorrows(profile?.role === "student" ? profile.id : undefined);

  const fineBorrows = (allBorrows ?? []).filter((b) => b.fine_amount > 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Library Fines"
        description="Track overdue penalties and fine payment records."
      />
      <LibraryFinesTable fineBorrows={fineBorrows as any[]} isLibrarian={isLibrarian} />
    </div>
  );
}
