import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/common/PageHeader";
import { BookCopiesTable } from "./BookCopiesTable";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Copies & QR Codes — Library",
};

export default async function BookCopiesPage() {
  const supabase = await createClient();

  const { data: copiesData } = await supabase
    .from("book_copies")
    .select(`*, books(title, isbn)`)
    .limit(50);

  const copies = (copiesData ?? []) as any[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Book Physical Copies & Barcode / QR Tokens"
        description="Track individual book copy numbers, QR identifiers, and loan status."
      />
      <BookCopiesTable copies={copies} />
    </div>
  );
}
