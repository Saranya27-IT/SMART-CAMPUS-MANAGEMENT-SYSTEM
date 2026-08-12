"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileSpreadsheet, Star, Utensils, AlertCircle, Lightbulb, Users, BarChart3 } from "lucide-react";
import { toast } from "sonner";

type Props = {
  stats: any;
  menusData: any[];
  attendanceData: any[];
  feedbackData: any[];
  complaintsData: any[];
  suggestionsData: any[];
};

export function MessAnalyticsClient({
  stats,
  menusData,
  attendanceData,
  feedbackData,
  complaintsData,
  suggestionsData,
}: Props) {
  const [exportType, setExportType] = useState("menus");
  const [exportFilter, setExportFilter] = useState("all");

  function convertToCSV(array: any[]) {
    if (!array || array.length === 0) return "";
    const headers = Object.keys(array[0]);
    const rows = array.map((row) =>
      headers
        .map((fieldName) => {
          const val = row[fieldName];
          const escaped = ("" + (val ?? "")).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    );
    return [headers.join(","), ...rows].join("\n");
  }

  function handleExport() {
    let dataToExport: any[] = [];
    let filename = `mess_${exportType}_export_${new Date().toISOString().split("T")[0]}.csv`;

    if (exportType === "menus") {
      dataToExport = menusData.map((m) => ({
        Date: m.date,
        "Meal Type": m.meal_type,
        "Menu Items": (m.items || []).join(" | "),
      }));
    } else if (exportType === "attendance") {
      dataToExport = attendanceData.map((a) => ({
        Date: a.date,
        "Meal Type": a.meal_type,
        "Student Name": a.profiles?.full_name || "N/A",
        "Roll Number": a.profiles?.roll_number || "N/A",
        Status: a.present ? "Present" : "Absent",
      }));
    } else if (exportType === "feedback") {
      dataToExport = feedbackData.map((f) => ({
        Date: f.date,
        "Meal Type": f.meal_type,
        "Student Name": f.profiles?.full_name || "N/A",
        Rating: f.rating,
        Comment: f.comment || "N/A",
      }));
    } else if (exportType === "complaints") {
      dataToExport = complaintsData.map((c) => ({
        "Complaint ID": c.id,
        "Student Name": c.profiles?.full_name || "N/A",
        Category: c.category,
        Description: c.description,
        "Meal Date": c.meal_date || "N/A",
        "Meal Type": c.meal_type || "N/A",
        Status: c.status,
        "Resolution Remarks": c.resolution_remarks || "N/A",
        "Created At": c.created_at,
      }));
    } else if (exportType === "suggestions") {
      dataToExport = suggestionsData.map((s) => ({
        "Suggestion ID": s.id,
        "Student Name": s.profiles?.full_name || "N/A",
        Suggestion: s.suggestion,
        Status: s.status,
        "Created At": s.created_at,
      }));
    }

    if (exportFilter !== "all") {
      dataToExport = dataToExport.filter((item) =>
        Object.values(item).some(
          (val) => ("" + val).toLowerCase() === exportFilter.toLowerCase()
        )
      );
    }

    if (dataToExport.length === 0) {
      toast.error("No data available to export for selected criteria.");
      return;
    }

    const csvContent = convertToCSV(dataToExport);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${dataToExport.length} mess records to ${filename}!`);
  }

  return (
    <div className="space-y-6">
      {/* CSV/Excel Export Utility */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" /> Mess Data Export Utility (CSV / Excel)
          </CardTitle>
          <CardDescription>Export menus, attendance, feedback ratings, complaints, and suggestions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Select Export Category</label>
              <Select value={exportType} onValueChange={(val: any) => setExportType(val || "")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="menus">Mess Menus</SelectItem>
                  <SelectItem value="attendance">Meal Attendance Logs</SelectItem>
                  <SelectItem value="feedback">Food Feedback & Ratings</SelectItem>
                  <SelectItem value="complaints">Food Complaints</SelectItem>
                  <SelectItem value="suggestions">Food Suggestions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Filter Status (Optional)</label>
              <Select value={exportFilter} onValueChange={(val: any) => setExportFilter(val || "")}>
                <SelectTrigger><SelectValue placeholder="All Data" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Data (Unfiltered)</SelectItem>
                  <SelectItem value="present">Present Attendance</SelectItem>
                  <SelectItem value="open">Open Complaints</SelectItem>
                  <SelectItem value="resolved">Resolved Complaints</SelectItem>
                  <SelectItem value="pending">Pending Suggestions</SelectItem>
                  <SelectItem value="implemented">Implemented Suggestions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleExport} className="gap-2">
              <Download className="w-4 h-4" /> Download CSV Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" /> Overall Rating Index
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-center">
              <p className="text-xs text-muted-foreground">Average Rating Across All Meals</p>
              <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
                ★ {stats.averageRating > 0 ? stats.averageRating : "N/A"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Based on {stats.totalFeedbackCount} student reviews</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" /> Complaint Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center p-2.5 rounded-lg border">
              <span className="text-sm font-medium">Open / Pending</span>
              <Badge className="bg-amber-100 text-amber-700 border-amber-200">{stats.pendingComplaints}</Badge>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-lg border">
              <span className="text-sm font-medium">Resolved Issues</span>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                {stats.totalComplaints - stats.pendingComplaints}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-lg border">
              <span className="text-sm font-medium">Total Complaints</span>
              <Badge variant="outline">{stats.totalComplaints}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-blue-500" /> Suggestions Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center p-2.5 rounded-lg border">
              <span className="text-sm font-medium">New / Pending</span>
              <Badge className="bg-amber-100 text-amber-700 border-amber-200">{stats.pendingSuggestions}</Badge>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-lg border">
              <span className="text-sm font-medium">Implemented / Reviewed</span>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                {stats.totalSuggestions - stats.pendingSuggestions}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-lg border">
              <span className="text-sm font-medium">Total Suggestions</span>
              <Badge variant="outline">{stats.totalSuggestions}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
