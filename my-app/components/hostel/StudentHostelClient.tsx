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
import { Building2, BedDouble, ClipboardList, AlertCircle, CreditCard, CalendarCheck, ShieldAlert, Plus, CheckCircle2, XCircle, Clock, MapPin, Users, Phone } from "lucide-react";
import { toast } from "sonner";
import { createLeaveRequest, createHostelComplaint } from "@/lib/actions/hostel";
import { format } from "date-fns";

type Props = {
  overviewData: any;
};

export function StudentHostelClient({ overviewData }: Props) {
  const { isDayScholar, message, data } = overviewData;

  // Modals state
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [complaintOpen, setComplaintOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Leave Form State
  const [leaveFrom, setLeaveFrom] = useState("");
  const [leaveTo, setLeaveTo] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveDestination, setLeaveDestination] = useState("");
  const [leaveDetails, setLeaveDetails] = useState("");

  // Complaint Form State
  const [complaintCategory, setComplaintCategory] = useState("maintenance");
  const [complaintDescription, setComplaintDescription] = useState("");
  const [complaintPriority, setComplaintPriority] = useState("medium");

  if (isDayScholar) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
        <div className="w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center border border-rose-200 shadow-sm">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Access Restricted</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {message || "Hostel services are available only for hostel students."}
          </p>
          <div className="pt-3">
            <Badge variant="outline" className="px-3 py-1 bg-amber-50 text-amber-700 border-amber-200">
              Student Status: DAY_SCHOLAR
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  const allocation = data?.allocation;
  const roommates = data?.roommates || [];
  const fees = data?.fees || [];
  const leaves = data?.leaves || [];
  const complaints = data?.complaints || [];
  const attendance = data?.attendance || [];
  const hostelId = allocation?.hostel_id;

  async function handleLeaveSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hostelId) {
      toast.error("You do not have an active hostel allocation to submit leave.");
      return;
    }
    if (!leaveFrom || !leaveTo || !leaveReason) {
      toast.error("Please fill in all required leave fields.");
      return;
    }

    if (new Date(leaveFrom) > new Date(leaveTo)) {
      toast.error("From date cannot be after To date.");
      return;
    }

    setSubmitting(true);
    const res = await createLeaveRequest({
      hostel_id: hostelId,
      from_date: leaveFrom,
      to_date: leaveTo,
      reason: leaveReason,
      destination: leaveDestination,
      additional_details: leaveDetails,
    });
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Leave request submitted successfully (Status: PENDING)");
      setLeaveOpen(false);
      setLeaveFrom("");
      setLeaveTo("");
      setLeaveReason("");
      setLeaveDestination("");
      setLeaveDetails("");
    }
  }

  async function handleComplaintSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hostelId) {
      toast.error("You must have a hostel allocation to raise a complaint.");
      return;
    }
    if (!complaintDescription || complaintDescription.trim().length < 10) {
      toast.error("Description must be at least 10 characters.");
      return;
    }

    setSubmitting(true);
    const res = await createHostelComplaint({
      hostel_id: hostelId,
      category: complaintCategory,
      description: complaintDescription,
      priority: complaintPriority,
    });
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Complaint submitted successfully.");
      setComplaintOpen(false);
      setComplaintDescription("");
    }
  }

  return (
    <div className="space-y-6">
      {/* Allocation Banner Card */}
      {allocation ? (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-md flex-shrink-0">
                  <BedDouble className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black tracking-tight">{allocation.hostel_name}</span>
                    <Badge variant="secondary" className="font-semibold">{allocation.block_name}</Badge>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mt-0.5">
                    Room <span className="font-bold text-foreground">{allocation.room_number}</span> · Bed <span className="font-bold text-foreground">{allocation.bed_number}</span> · Floor {allocation.floor_number}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-primary" /> Condition: <span className="font-medium text-foreground">{allocation.room_condition || "Good"}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button size="sm" className="gap-1.5 flex-1 sm:flex-initial" onClick={() => setLeaveOpen(true)}>
                  <Plus className="w-4 h-4" /> Apply Leave
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5 flex-1 sm:flex-initial" onClick={() => setComplaintOpen(true)}>
                  <AlertCircle className="w-4 h-4 text-rose-500" /> Raise Complaint
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-amber-300 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="py-8 text-center space-y-2">
            <Building2 className="h-10 w-10 mx-auto text-amber-600" />
            <h3 className="font-semibold text-lg">No Active Room Bed Allocation</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              You are recognized as a <strong>HOSTELLER</strong>, but do not have a bed assigned yet. Please contact the Hostel Warden.
            </p>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Roommates</p>
              <p className="text-xl font-bold">{roommates.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Pending Fees</p>
              <p className="text-xl font-bold text-rose-600">₹{data?.totalPendingFee ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Leave Requests</p>
              <p className="text-xl font-bold">{leaves.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Complaints</p>
              <p className="text-xl font-bold">{complaints.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Roommates & Fee Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Roommates List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Roommates
            </CardTitle>
            <CardDescription>Students allocated to Room {allocation?.room_number || "—"}</CardDescription>
          </CardHeader>
          <CardContent>
            {roommates.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No other roommates in this room.</p>
            ) : (
              <div className="space-y-3">
                {roommates.map((rm: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div>
                      <p className="text-sm font-semibold">{rm.full_name}</p>
                      <p className="text-xs text-muted-foreground">{rm.roll_number} · {rm.department}</p>
                    </div>
                    <Badge variant="outline">Bed {rm.bed_number}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hostel Fee Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" /> Fee Overview
            </CardTitle>
            <CardDescription>Your current hostel fee status and dues</CardDescription>
          </CardHeader>
          <CardContent>
            {fees.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No hostel fee records generated yet.</p>
            ) : (
              <div className="space-y-3">
                {fees.map((fee: any) => (
                  <div key={fee.id} className="p-3 rounded-lg border space-y-1 bg-card">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">Period: {fee.period}</span>
                      <Badge className={
                        fee.fee_status === "Paid" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                        fee.fee_status === "Overdue" ? "bg-rose-100 text-rose-700 border-rose-200" :
                        "bg-amber-100 text-amber-700 border-amber-200"
                      }>
                        {fee.fee_status}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground pt-1">
                      <span>Total: ₹{fee.amount}</span>
                      <span>Paid: ₹{fee.paid_amount}</span>
                      <span className="font-semibold text-foreground">Pending: ₹{fee.pending_amount}</span>
                    </div>
                    {fee.due_date && (
                      <p className="text-[11px] text-muted-foreground pt-0.5">
                        Due Date: {format(new Date(fee.due_date), "dd MMM yyyy")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Leave Requests Table/Cards */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">My Leave Requests</CardTitle>
            <CardDescription>History of leave applications and approval status</CardDescription>
          </div>
          <Button size="sm" onClick={() => setLeaveOpen(true)} className="gap-1">
            <Plus className="w-4 h-4" /> Apply Leave
          </Button>
        </CardHeader>
        <CardContent>
          {leaves.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No leave requests submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {leaves.map((leave: any) => (
                <div key={leave.id} className="p-4 rounded-xl border space-y-2 bg-card">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-semibold">
                        {format(new Date(leave.from_date), "dd MMM yyyy")} — {format(new Date(leave.to_date), "dd MMM yyyy")}
                      </span>
                    </div>
                    <Badge className={
                      leave.status === "approved" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                      leave.status === "rejected" ? "bg-rose-100 text-rose-700 border-rose-200" :
                      "bg-amber-100 text-amber-700 border-amber-200"
                    }>
                      {leave.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-foreground font-medium">Reason: <span className="font-normal text-muted-foreground">{leave.reason}</span></p>
                  {leave.destination && (
                    <p className="text-xs text-muted-foreground">Destination: {leave.destination}</p>
                  )}
                  {leave.warden_remark && (
                    <div className="p-2 rounded-md bg-muted/60 text-xs text-muted-foreground border mt-1">
                      <span className="font-semibold text-foreground">Warden Remark:</span> {leave.warden_remark}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Complaints History */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">My Hostel Complaints</CardTitle>
            <CardDescription>Track status of raised issues</CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={() => setComplaintOpen(true)} className="gap-1">
            <Plus className="w-4 h-4" /> Raise Complaint
          </Button>
        </CardHeader>
        <CardContent>
          {complaints.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No complaints raised.</p>
          ) : (
            <div className="space-y-3">
              {complaints.map((c: any) => (
                <div key={c.id} className="p-4 rounded-xl border space-y-2 bg-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">{c.category}</Badge>
                      <span className="text-xs text-muted-foreground">{format(new Date(c.created_at), "dd MMM yyyy")}</span>
                    </div>
                    <Badge className={
                      c.status === "resolved" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                      c.status === "in_progress" ? "bg-blue-100 text-blue-700 border-blue-200" :
                      "bg-amber-100 text-amber-700 border-amber-200"
                    }>
                      {c.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground">{c.description}</p>
                  {c.resolution_remarks && (
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded border border-emerald-200">
                      <strong>Resolution:</strong> {c.resolution_remarks}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Apply Leave Modal */}
      <Dialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Apply for Hostel Leave</DialogTitle>
            <DialogDescription>Submit leave dates and reason to Warden for approval.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLeaveSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="leaveFrom">From Date *</Label>
                <Input id="leaveFrom" type="date" value={leaveFrom} onChange={(e) => setLeaveFrom(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="leaveTo">To Date *</Label>
                <Input id="leaveTo" type="date" value={leaveTo} onChange={(e) => setLeaveTo(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="leaveReason">Reason *</Label>
              <Textarea id="leaveReason" placeholder="State explicit reason for leave..." value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} required rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="leaveDest">Destination</Label>
              <Input id="leaveDest" placeholder="e.g. Home town, City..." value={leaveDestination} onChange={(e) => setLeaveDestination(e.target.value)} />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setLeaveOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Leave Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Raise Complaint Modal */}
      <Dialog open={complaintOpen} onOpenChange={setComplaintOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Raise Hostel Complaint</DialogTitle>
            <DialogDescription>Report room, cleanliness, or maintenance issues.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleComplaintSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Select value={complaintCategory} onValueChange={(val: any) => setComplaintCategory(val || "")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="cleanliness">Cleanliness</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="noise">Noise</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={complaintPriority} onValueChange={(val: any) => setComplaintPriority(val || "")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description * (min 10 chars)</Label>
              <Textarea placeholder="Describe the issue in detail..." value={complaintDescription} onChange={(e) => setComplaintDescription(e.target.value)} required rows={4} />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setComplaintOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Complaint"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
