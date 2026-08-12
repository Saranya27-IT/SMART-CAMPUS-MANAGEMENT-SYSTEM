"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bus, Download, BarChart3, Users, Route, MapPin, AlertTriangle, ShieldCheck } from "lucide-react";
import { getBusExportData } from "@/lib/actions/bus";
import { toast } from "sonner";

type Props = {
  stats: any;
};

export function BusAnalyticsClient({ stats }: Props) {
  const [exportType, setExportType] = useState("buses");
  const [exporting, setExporting] = useState(false);

  async function handleExportCSV() {
    setExporting(true);
    const res = await getBusExportData(exportType);
    setExporting(false);

    if (res.error || !res.data) {
      toast.error(res.error || "Failed to fetch export dataset.");
      return;
    }

    const data = res.data;
    if (data.length === 0) {
      toast.error("No records found for selected export category.");
      return;
    }

    // Convert JSON array to CSV format
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(",")];

    for (const row of data) {
      const rowObj = row as any;
      const values = headers.map((header) => {
        let val = rowObj[header];
        if (typeof val === "object" && val !== null) {
          val = JSON.stringify(val);
        }
        const escaped = ("" + (val ?? "")).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(","));
    }

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csvRows.join("\n"));
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `bus_data_${exportType}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${data.length} ${exportType} records to CSV.`);
  }

  return (
    <div className="space-y-6">
      {/* Analytics KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider">Fleet Capacity Utilization</CardDescription>
            <CardTitle className="text-3xl font-black text-foreground flex items-center gap-2">
              <Bus className="w-6 h-6 text-primary" /> {stats.capacityUtilization}%
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {stats.totalAssignedStudents} / {stats.totalCapacity} total seats filled
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider">Active Bus Vehicles</CardDescription>
            <CardTitle className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {stats.activeBuses} / {stats.totalBuses}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {stats.maintenanceBuses} maintenance, {stats.breakdownBuses} breakdown
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider">Routes & Stops</CardDescription>
            <CardTitle className="text-3xl font-black text-foreground flex items-center gap-2">
              <Route className="w-6 h-6 text-blue-500" /> {stats.totalRoutes}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {stats.totalStops} active boarding bus stops
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider">Pending Complaints</CardDescription>
            <CardTitle className="text-3xl font-black text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-500" /> {stats.pendingComplaintsCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {stats.resolvedComplaintsCount} resolved driver complaints
          </CardContent>
        </Card>
      </div>

      {/* CSV Export Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Download className="w-4 h-4 text-primary" /> Bus Module CSV / Excel Data Export
          </CardTitle>
          <CardDescription>Download structured reports for fleet buses, routes, driver allocations, and complaints.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground">Select Export Category</label>
              <Select value={exportType} onValueChange={(val: any) => setExportType(val || "buses")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="buses">Bus Vehicles List</SelectItem>
                  <SelectItem value="routes">Campus Shuttle Routes</SelectItem>
                  <SelectItem value="stops">Bus Stops & Arrival Timings</SelectItem>
                  <SelectItem value="allocations">Day Scholar Student Allocations</SelectItem>
                  <SelectItem value="complaints">Driver Breakdown Complaints</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleExportCSV} disabled={exporting} className="gap-2 w-full">
              <Download className="w-4 h-4" /> {exporting ? "Generating CSV..." : "Export CSV File"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
