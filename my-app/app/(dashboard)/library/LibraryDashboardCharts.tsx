"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LibraryDashboardChartsProps {
  categoryDistribution: { name: string; count: number }[];
  copyStatusData: { name: string; value: number; color: string }[];
}

const BAR_COLOR = "var(--primary, #4f46e5)";

export function LibraryDashboardCharts({ categoryDistribution, copyStatusData }: LibraryDashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Category Distribution Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Books by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {!categoryDistribution || categoryDistribution.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
              No category data available.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" interval={0} />
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

      {/* Available vs Borrowed Donut Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Copy Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full flex flex-col md:flex-row items-center justify-center gap-6">
            <ResponsiveContainer width="60%" height="100%">
              <PieChart>
                <Pie
                  data={copyStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
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
            <div className="flex flex-col gap-2">
              {copyStatusData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs font-medium">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}:</span>
                  <span className="font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
