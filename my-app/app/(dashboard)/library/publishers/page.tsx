import { getPublishers } from "@/lib/actions/library";
import { PageHeader } from "@/components/common/PageHeader";
import { PublishersTable } from "./PublishersTable";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Publishers — Library",
};

export default async function BookPublishersPage() {
  const publishers = await getPublishers();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Book Publishers"
        description="Directory of publishing houses and distributors."
      />
      <PublishersTable publishers={publishers} />
    </div>
  );
}
