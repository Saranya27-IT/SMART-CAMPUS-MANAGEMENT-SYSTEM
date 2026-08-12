"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, BarChart3, PieChart, FileSpreadsheet, Building2, UserCheck, CreditCard, ClipboardList, AlertCircle, CalendarCheck } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type Props = {
  studentsData: any[];
  allocationsData: any[];
  feesData: any[];
  leavesData: any[];
  complaintsData: any[];
  attendanceData: any[];
};

export function HostelAnalyticsClient({
  studentsData,
  allocationsData,
  feesData,
  leavesData,
  complaintsData,
  attendanceData,
}: Props) {
  const [exportType, setExportType] = useState("students");
  const [exportStatusFilter, setExportStatusFilter] = useState("all");

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
    let filename = `hostel_${exportType}_export_${new Date().toISOString().split("T")[0]}.csv`;

    if (exportType === "students") {
      dataToExport = studentsData.map((s) => ({
        "Student Name": s.full_name,
        "Roll Number": s.roll_number,
        Department: s.department,
        Email: s.email,
        Phone: s.phone,
        "Student Type": s.student_type,
        Hostel: s.hostel_name,
        "Room Number": s.room_number,
        "Bed Number": s.bed_number,
        "Fee Status": s.fee_status,
      }));
    } else if (exportType === "allocations") {
      dataToExport = allocationsData.map((a) => ({
        "Bed ID": a.id,
        "Bed Number": a.bed_number,
        "Student Name": a.profiles?.full_name || "N/A",
        "Roll Number": a.profiles?.roll_number || "N/A",
        "Room Number": a.hostel_rooms?.room_number || "N/A",
        "Block": a.hostel_rooms?.hostel_floors?.hostel_blocks?.name || "N/A",
        "Hostel": a.hostel_rooms?.hostel_floors?.hostel_blocks?.hostels?.name || "N/A",
        "Allocated Date": a.allocated_at || "N/A",
      }));
    } else if (exportType === "fees") {
      dataToExport = feesData.map((f) => ({
        "Student Name": f.student_name,
        "Roll Number": f.roll_number,
        Hostel: f.hostel_name,
        Period: f.period,
        "Total Amount": f.amount,
        "Paid Amount": f.paid_amount,
        "Pending Amount": f.pending_amount,
        "Due Date": f.due_date,
        Status: f.computed_status,
      }));
    } else if (exportType === "leaves") {
      dataToExport = leavesData.map((l) => ({
        "Student Name": l.profiles?.full_name || "N/A",
        "Roll Number": l.profiles?.roll_number || "N/A",
        "From Date": l.from_date,
        "To Date": l.to_date,
        Reason: l.reason,
        Destination: l.destination || "N/A",
        Status: l.status,
        "Warden Remark": l.warden_remark || "N/A",
      }));
    } else if (exportType === "complaints") {
      dataToExport = complaintsData.map((c) => ({
        "Complaint ID": c.id,
        "Student Name": c.profiles?.full_name || "N/A",
        Category: c.category,
        Description: c.description,
        Priority: c.priority,
        Status: c.status,
        "Resolution Remarks": c.resolution_remarks || "N/A",
        "Created Date": c.created_at,
      }));
    } else if (exportType === "attendance") {
      dataToExport = attendanceData.map((a) => ({
        Date: a.date,
        "Student Name": a.profiles?.full_name || "N/A",
        "Roll Number": a.profiles?.roll_number || "N/A",
        Status: a.status,
      }));
    }

    if (exportStatusFilter !== "all") {
      dataToExport = dataToExport.filter((item) =>
        Object.values(item).some(
          (val) => ("" + val).toLowerCase() === exportStatusFilter.toLowerCase()
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

    toast.success(`Exported ${dataToExport.length} records to ${filename}!`);
  }

  return (
    <div className="space-y-6">
      {/* Export Section Card */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" /> Data Export Utility (CSV / Excel)
          </CardTitle>
          <CardDescription>Select dataset, apply optional status filter, and download spreadsheet reports.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Select Export Module</label>
              <Select value={exportType} onValueChange={(val: any) => setExportType(val || "")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="students">Hostel Students List</SelectItem>
                  <SelectItem value="allocations">Room Bed Allocations</SelectItem>
                  <SelectItem value="fees">Hostel Fee Records</SelectItem>
                  <SelectItem value="leaves">Leave Requests</SelectItem>
                  <SelectItem value="complaints">Hostel Complaints</SelectItem>
                  <SelectItem value="attendance">Attendance Logs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Filter Status (Optional)</label>
              <Select value={exportStatusFilter} onValueChange={(val: any) => setExportStatusFilter(val || "")}>
                <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Data (Unfiltered)</SelectItem>
                  <SelectItem value="occupied">Occupied / Allocated</SelectItem>
                  <SelectItem value="paid">Paid Fees</SelectItem>
                  <SelectItem value="overdue">Overdue Fees</SelectItem>
                  <SelectItem value="pending">Pending Status</SelectItem>
                  <SelectItem value="approved">Approved Status</SelectItem>
                  <SelectItem value="rejected">Rejected Status</SelectItem>
                  <SelectItem value="resolved">Resolved Status</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleExport} className="gap-2">
              <Download className="w-4 h-4" /> Download CSV Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" /> Student Type Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg border">
              <span className="text-sm font-medium">HOSTELLER Students</span>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                {studentsData.filter((s) => s.student_type === "HOSTELLER").length}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg border">
              <span className="text-sm font-medium">DAY_SCHOLAR Students</span>
              <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                {studentsData.filter((s) => s.student_type === "DAY_SCHOLAR").length}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-violet-600" /> Fee Collection Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg border">
              <span className="text-sm font-medium">Fully Paid</span>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                {feesData.filter((f) => f.computed_status === "Paid").length}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg border">
              <span className="text-sm font-medium">Overdue Accounts</span>
              <Badge className="bg-rose-100 text-rose-700 border-rose-200">
                {feesData.filter((f) => f.computed_status === "Overdue").length}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-amber-600" /> Leave Request Statuses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg border">
              <span className="text-sm font-medium">Pending Approvals</span>
              <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                {leavesData.filter((l) => l.status === "pending").length}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg border">
              <span className="text-sm font-medium">Approved Requests</span>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                {leavesData.filter((l) => l.status === "approved").length}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
