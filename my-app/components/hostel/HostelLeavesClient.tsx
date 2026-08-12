"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Plus, Search, CheckCircle2, XCircle, Clock, MapPin, AlertCircle } from "lucide-react";
import { approveLeaveRequest, createLeaveRequest } from "@/lib/actions/hostel";
import { toast } from "sonner";
import { format } from "date-fns";

type Props = {
  leaves: any[];
  isWarden: boolean;
  userHostelId?: string;
};

export function HostelLeavesClient({ leaves, isWarden, userHostelId }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Reject Modal
  const [rejectOpen, setRejectOpen] = useState(false);
  const [targetLeave, setTargetLeave] = useState<any>(null);
  const [rejectRemark, setRejectRemark] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Apply Leave Modal (Student)
  const [applyOpen, setApplyOpen] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [destination, setDestination] = useState("");
  const [details, setDetails] = useState("");

  const filteredLeaves = leaves.filter((l) => {
    const q = search.toLowerCase();
    const nameMatch = (l.profiles?.full_name || "").toLowerCase().includes(q);
    const rollMatch = (l.profiles?.roll_number || "").toLowerCase().includes(q);
    const reasonMatch = (l.reason || "").toLowerCase().includes(q);

    const matchesSearch = nameMatch || rollMatch || reasonMatch;
    const matchesStatus = statusFilter === "all" || l.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  async function handleApprove(leaveId: string) {
    setSubmitting(true);
    const res = await approveLeaveRequest(leaveId, "approved", "Approved by Warden");
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Leave request approved.");
    }
  }

  async function handleRejectSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rejectRemark || rejectRemark.trim().length === 0) {
      toast.error("Rejection reason is REQUIRED.");
      return;
    }

    setSubmitting(true);
    const res = await approveLeaveRequest(targetLeave.id, "rejected", rejectRemark.trim());
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Leave request rejected.");
      setRejectOpen(false);
      setTargetLeave(null);
      setRejectRemark("");
    }
  }

  async function handleApplySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fromDate || !toDate || !reason) {
      toast.error("Please fill in required fields.");
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      toast.error("From date cannot be after To date.");
      return;
    }

    setSubmitting(true);
    const res = await createLeaveRequest({
      hostel_id: userHostelId || leaves[0]?.hostel_id,
      from_date: fromDate,
      to_date: toDate,
      reason,
      destination,
      additional_details: details,
    });
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Leave request submitted successfully (PENDING).");
      setApplyOpen(false);
      setFromDate("");
      setToDate("");
      setReason("");
      setDestination("");
      setDetails("");
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search Student, Roll No, Reason..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val || "")}>
              <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!isWarden && (
            <Button onClick={() => setApplyOpen(true)} className="gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" /> Apply for Leave
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Leave Requests Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Leave Applications ({filteredLeaves.length})</CardTitle>
          <CardDescription>Track status, leave durations, reasons, and warden notes</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLeaves.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No leave applications found matching filter.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-muted-foreground text-xs uppercase font-semibold">
                    <th className="p-3">Student</th>
                    <th className="p-3">Leave Dates</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Destination</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Warden Note</th>
                    {isWarden && <th className="p-3 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredLeaves.map((leave) => {
                    const student = leave.profiles;

                    return (
                      <tr key={leave.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3 font-semibold text-foreground">
                          {student?.full_name || "Student"}
                          <p className="text-xs text-muted-foreground font-mono font-normal">{student?.roll_number || "STU"}</p>
                        </td>
                        <td className="p-3 text-xs font-medium">
                          {format(new Date(leave.from_date), "dd MMM yyyy")} — {format(new Date(leave.to_date), "dd MMM yyyy")}
                        </td>
                        <td className="p-3 text-xs max-w-xs">{leave.reason}</td>
                        <td className="p-3 text-xs text-muted-foreground">{leave.destination || "—"}</td>
                        <td className="p-3">
                          <Badge className={
                            leave.status === "approved" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                            leave.status === "rejected" ? "bg-rose-100 text-rose-700 border-rose-200" :
                            "bg-amber-100 text-amber-700 border-amber-200 font-bold"
                          }>
                            {leave.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">
                          {leave.warden_remark || "—"}
                        </td>
                        {isWarden && (
                          <td className="p-3 text-right">
                            {leave.status === "pending" ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-xs"
                                  onClick={() => handleApprove(leave.id)}
                                  disabled={submitting}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-rose-600 border-rose-200 hover:bg-rose-50 h-7 text-xs"
                                  onClick={() => {
                                    setTargetLeave(leave);
                                    setRejectRemark("");
                                    setRejectOpen(true);
                                  }}
                                  disabled={submitting}
                                >
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground font-medium">Processed</span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog (Warden - Mandatory Remark) */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Reject Leave Request</DialogTitle>
            <DialogDescription>
              Provide a mandatory rejection reason for <strong>{targetLeave?.profiles?.full_name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRejectSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="rejectReasonInput">Rejection Reason (Required) *</Label>
              <Textarea
                id="rejectReasonInput"
                placeholder="State the reason why this leave request is being rejected..."
                value={rejectRemark}
                onChange={(e) => setRejectRemark(e.target.value)}
                required
                rows={3}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
              <Button type="submit" variant="destructive" disabled={submitting || !rejectRemark.trim()}>
                {submitting ? "Rejecting..." : "Confirm Rejection"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Apply Leave Dialog (Student) */}
      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Apply for Hostel Leave</DialogTitle>
            <DialogDescription>Submit dates and reason for Warden approval.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleApplySubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="fDate">From Date *</Label>
                <Input id="fDate" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tDate">To Date *</Label>
                <Input id="tDate" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rInput">Reason * (min 5 chars)</Label>
              <Textarea id="rInput" placeholder="Detailed reason..." value={reason} onChange={(e) => setReason(e.target.value)} required rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dInput">Destination</Label>
              <Input id="dInput" placeholder="e.g. Home town, hospital..." value={destination} onChange={(e) => setDestination(e.target.value)} />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setApplyOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Leave Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
