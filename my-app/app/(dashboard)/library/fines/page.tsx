import { redirect } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { getFines } from "@/lib/actions/library";
import { getCurrentUser } from "@/lib/actions/auth";
import { LibraryFinesTable } from "./LibraryFinesTable";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fines — Library | Smart Campus",
  description: "View and manage library overdue fines and payments.",
};

export default async function FinesPage() {
  const profile = await getCurrentUser();
  if (!profile) redirect("/login");

  const isLibrarian = profile.role === "librarian" || profile.role === "super_admin";
  const { data: fineBorrows } = await getFines();

  return (
    <div className="space-y-6">
      <PageHeader
        title={isLibrarian ? "Library Fine Management" : "My Fines"}
        description={
          isLibrarian
            ? "Inspect overdue penalties, mark payments, and handle fee waivers."
            : "Review your overdue fine amounts and payment statuses."
        }
      />
      <LibraryFinesTable fineBorrows={fineBorrows ?? []} isLibrarian={isLibrarian} />
    </div>
  );
}
