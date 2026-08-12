import { getAuthors } from "@/lib/actions/library";
import { PageHeader } from "@/components/common/PageHeader";
import { AuthorsTable } from "./AuthorsTable";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Authors — Library",
};

export default async function BookAuthorsPage() {
  const authors = await getAuthors();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Book Authors"
        description="Catalogue of accredited book authors."
      />
      <AuthorsTable authors={authors} />
    </div>
  );
}
