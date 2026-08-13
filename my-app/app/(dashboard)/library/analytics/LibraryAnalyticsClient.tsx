"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard } from "@/components/common/StatCard";
import { BookOpen, BookMarked, IndianRupee, Users, TrendingUp, Library, Layers, FolderTree, AlertCircle, UserCheck } from "lucide-react";

interface LibraryAnalyticsClientProps {
  analytics: {
    totalBooks: number;
    totalCopies: number;
    availableCopies: number;
    borrowedCopies: number;
    totalBorrows: number;
    activeBorrows: number;
    overdueBorrows: number;
    totalFines: number;
    paidFines: number;
    totalAuthors: number;
    totalCategories: number;
    totalPublishers: number;
    categoryDistribution: { name: string; count: number }[];
  };
}

export function LibraryAnalyticsClient({ analytics }: LibraryAnalyticsClientProps) {
  const copyStatusData = [
    { name: "Available", value: analytics.availableCopies, color: "#10b981" },
    { name: "Borrowed", value: analytics.borrowedCopies, color: "#3b82f6" },
    { name: "Overdue", value: analytics.overdueBorrows, color: "#f43f5e" },
  ];

  const fineStatusData = [
    { name: "Paid Fines (₹)", value: analytics.paidFines, color: "#10b981" },
    { name: "Pending Fines (₹)", value: Math.max(0, analytics.totalFines - analytics.paidFines), color: "#f43f5e" },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Catalogue Books" value={analytics.totalBooks} icon={Library} color="indigo" />
        <StatCard title="Physical Inventory Copies" value={analytics.totalCopies} icon={Layers} color="cyan" />
        <StatCard title="Active Loans" value={analytics.activeBorrows} icon={BookMarked} color="cyan" />
        <StatCard title="Overdue Items" value={analytics.overdueBorrows} icon={AlertCircle} color="rose" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Available to Loan" value={analytics.availableCopies} icon={BookOpen} color="emerald" />
        <StatCard title="Total Lifetime Borrows" value={analytics.totalBorrows} icon={TrendingUp} color="amber" />
        <StatCard title="Total Fines Generated" value={`₹${analytics.totalFines}`} icon={IndianRupee} color="violet" />
        <StatCard title="Fines Collected" value={`₹${analytics.paidFines}`} icon={IndianRupee} color="emerald" />
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Books by Category</CardTitle>
            <CardDescription>Number of titles catalogued in each subject category.</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.categoryDistribution.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
                No category data available.
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.categoryDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 35 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1f2937", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                    />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Copy Availability Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Copy Status Distribution</CardTitle>
            <CardDescription>Breakdown of physical copy availability and loan statuses.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full flex flex-col sm:flex-row items-center justify-center gap-6">
              <ResponsiveContainer width="60%" height="100%">
                <PieChart>
                  <Pie
                    data={copyStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {copyStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f2937", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-3">
                {copyStatusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs font-medium">
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}:</span>
                    <span className="font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Library Operations Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Library Directory Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-xl border bg-card">
            <Users className="h-6 w-6 mx-auto text-blue-600 mb-1" />
            <p className="text-2xl font-bold">{analytics.totalAuthors}</p>
            <p className="text-xs text-muted-foreground font-medium">Registered Authors</p>
          </div>
          <div className="p-4 rounded-xl border bg-card">
            <FolderTree className="h-6 w-6 mx-auto text-amber-600 mb-1" />
            <p className="text-2xl font-bold">{analytics.totalCategories}</p>
            <p className="text-xs text-muted-foreground font-medium">Subject Categories</p>
          </div>
          <div className="p-4 rounded-xl border bg-card">
            <UserCheck className="h-6 w-6 mx-auto text-emerald-600 mb-1" />
            <p className="text-2xl font-bold">{analytics.totalPublishers}</p>
            <p className="text-xs text-muted-foreground font-medium">Publishers</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
