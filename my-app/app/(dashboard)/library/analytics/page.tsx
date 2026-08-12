import { getLibraryAnalytics } from "@/lib/actions/library";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, BookMarked, TrendingUp, Library } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Library Analytics — Smart Campus",
};

export default async function LibraryAnalyticsPage() {
  const analytics = await getLibraryAnalytics();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Library Analytics"
        description="Circulation statistics, circulation rates, and book activity."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Catalogue" value={analytics.totalBooks} icon={Library} color="indigo" />
        <StatCard title="Active Borrows" value={analytics.activeBorrows} icon={BookMarked} color="amber" />
        <StatCard title="Overdue Items" value={analytics.overdue} icon={TrendingUp} color="rose" />
        <StatCard title="Returned This Month" value={analytics.returnedThisMonth} icon={BookOpen} color="emerald" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Circulation Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Total transactions processed to date: <span className="font-semibold text-foreground">{analytics.totalBorrows}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
