"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CreditCard, Search, Plus, DollarSign, Calendar, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { createHostelFeeRecord, recordFeePayment } from "@/lib/actions/hostel";
import { toast } from "sonner";
import { format } from "date-fns";

type Props = {
  fees: any[];
  isWarden: boolean;
  students: any[];
  hostels: any[];
};

export function HostelFeesClient({ fees, isWarden, students, hostels }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Create Fee Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [hostelId, setHostelId] = useState("");
  const [period, setPeriod] = useState("2026-Q3");
  const [amount, setAmount] = useState("");
  const [paidAmount, setPaidAmount] = useState("0");
  const [dueDate, setDueDate] = useState("");

  // Payment Record Modal
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [payAmountInput, setPayAmountInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const filteredFees = fees.filter((f) => {
    const q = search.toLowerCase();
    const nameMatch = (f.student_name || "").toLowerCase().includes(q);
    const rollMatch = (f.roll_number || "").toLowerCase().includes(q);
    const periodMatch = (f.period || "").toLowerCase().includes(q);

    const matchesSearch = nameMatch || rollMatch || periodMatch;
    const matchesStatus = statusFilter === "all" || f.computed_status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Calculate totals
  const totalBilled = fees.reduce((acc, f) => acc + (f.amount || 0), 0);
  const totalPaid = fees.reduce((acc, f) => acc + (f.paid_amount || 0), 0);
  const totalPending = fees.reduce((acc, f) => acc + (f.pending_amount || 0), 0);
  const overdueCount = fees.filter((f) => f.computed_status === "Overdue").length;

  async function handleCreateFeeSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numAmount = Number(amount);
    const numPaid = Number(paidAmount) || 0;

    if (!studentId || !hostelId || !period || !dueDate) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (isNaN(numAmount) || numAmount < 0) {
      toast.error("Fee amount cannot be negative.");
      return;
    }
    if (numPaid < 0) {
      toast.error("Paid amount cannot be negative.");
      return;
    }
    if (numPaid > numAmount) {
      toast.error("Paid amount cannot be greater than total fee amount.");
      return;
    }

    setSubmitting(true);
    const res = await createHostelFeeRecord({
      student_id: studentId,
      hostel_id: hostelId,
      period,
      amount: numAmount,
      paid_amount: numPaid,
      due_date: dueDate,
    });
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Hostel fee record created successfully.");
      setCreateOpen(false);
      resetCreateForm();
    }
  }

  async function handleRecordPaymentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFee) return;
    const payVal = Number(payAmountInput);

    if (isNaN(payVal) || payVal <= 0) {
      toast.error("Payment amount must be greater than zero.");
      return;
    }
    if (payVal > selectedFee.pending_amount) {
      toast.error(`Payment amount cannot exceed pending balance of ₹${selectedFee.pending_amount}.`);
      return;
    }

    setSubmitting(true);
    const res = await recordFeePayment(selectedFee.id, payVal);
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`Recorded payment of ₹${payVal} for ${selectedFee.student_name}.`);
      setPaymentOpen(false);
      setSelectedFee(null);
      setPayAmountInput("");
    }
  }

  function resetCreateForm() {
    setStudentId("");
    setHostelId("");
    setPeriod("2026-Q3");
    setAmount("");
    setPaidAmount("0");
    setDueDate("");
  }

  return (
    <div className="space-y-6">
      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium">Total Billed</p>
            <p className="text-2xl font-bold text-foreground">₹{totalBilled.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium">Total Paid</p>
            <p className="text-2xl font-bold text-emerald-600">₹{totalPaid.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium">Total Pending Balance</p>
            <p className="text-2xl font-bold text-amber-600">₹{totalPending.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium">Overdue Accounts</p>
            <p className="text-2xl font-bold text-rose-600">{overdueCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Add Fee Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search Student, Roll No, Period..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val || "")}>
                <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partially paid">Partially Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isWarden && (
              <Button onClick={() => setCreateOpen(true)} className="gap-2 w-full sm:w-auto">
                <Plus className="w-4 h-4" /> Create Fee Record
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fees Data Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Fee Records ({filteredFees.length})</CardTitle>
          <CardDescription>Comprehensive billing, paid amount, pending dues, and overdue flags</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredFees.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No fee records found matching search filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-muted-foreground text-xs uppercase font-semibold">
                    <th className="p-3">Student</th>
                    <th className="p-3">Hostel</th>
                    <th className="p-3">Period</th>
                    <th className="p-3">Total Fee</th>
                    <th className="p-3">Paid Amount</th>
                    <th className="p-3">Pending Amount</th>
                    <th className="p-3">Due Date</th>
                    <th className="p-3">Payment Status</th>
                    {isWarden && <th className="p-3 text-right">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredFees.map((fee) => {
                    const isOverdue = fee.computed_status === "Overdue";

                    return (
                      <tr key={fee.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3 font-semibold text-foreground">
                          {fee.student_name}
                          <p className="text-xs text-muted-foreground font-mono font-normal">{fee.roll_number}</p>
                        </td>
                        <td className="p-3 text-xs font-medium">{fee.hostel_name}</td>
                        <td className="p-3 font-medium text-xs">{fee.period}</td>
                        <td className="p-3 font-bold text-foreground">₹{fee.amount}</td>
                        <td className="p-3 font-medium text-emerald-600">₹{fee.paid_amount}</td>
                        <td className="p-3 font-medium text-rose-600">₹{fee.pending_amount}</td>
                        <td className="p-3 text-xs text-muted-foreground">
                          {fee.due_date ? format(new Date(fee.due_date), "dd MMM yyyy") : "—"}
                        </td>
                        <td className="p-3">
                          <Badge className={
                            fee.computed_status === "Paid" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                            fee.computed_status === "Partially Paid" ? "bg-blue-100 text-blue-700 border-blue-200" :
                            isOverdue ? "bg-rose-100 text-rose-700 border-rose-200 font-bold" :
                            "bg-amber-100 text-amber-700 border-amber-200"
                          }>
                            {fee.computed_status}
                          </Badge>
                        </td>
                        {isWarden && (
                          <td className="p-3 text-right">
                            {fee.pending_amount > 0 ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs"
                                onClick={() => {
                                  setSelectedFee(fee);
                                  setPayAmountInput(String(fee.pending_amount));
                                  setPaymentOpen(true);
                                }}
                              >
                                Record Payment
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Settled
                              </span>
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

      {/* Record Payment Dialog */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record fee payment for <strong>{selectedFee?.student_name}</strong> (Period: {selectedFee?.period})
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 py-2">
            <div className="p-3 rounded-lg border bg-muted/40 space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Total Fee:</span> <strong className="text-foreground">₹{selectedFee?.amount}</strong>
              </div>
              <div className="flex justify-between">
                <span>Already Paid:</span> <strong className="text-emerald-600">₹{selectedFee?.paid_amount}</strong>
              </div>
              <div className="flex justify-between border-t pt-1">
                <span>Pending Balance:</span> <strong className="text-rose-600">₹{selectedFee?.pending_amount}</strong>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="payInput">Payment Amount (₹) *</Label>
              <Input
                id="payInput"
                type="number"
                min="1"
                max={selectedFee?.pending_amount}
                value={payAmountInput}
                onChange={(e) => setPayAmountInput(e.target.value)}
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setPaymentOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Confirm Payment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Fee Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Create Hostel Fee Record</DialogTitle>
            <DialogDescription>Issue a hostel accommodation fee bill for a student.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateFeeSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Select Student *</Label>
              <Select value={studentId} onValueChange={(val: any) => setStudentId(val || "")}>
                <SelectTrigger><SelectValue placeholder="Choose student..." /></SelectTrigger>
                <SelectContent className="max-h-56">
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.full_name} ({s.roll_number || "STU"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Hostel *</Label>
                <Select value={hostelId} onValueChange={(val: any) => setHostelId(val || "")}>
                  <SelectTrigger><SelectValue placeholder="Select hostel..." /></SelectTrigger>
                  <SelectContent>
                    {hostels.map((h) => (
                      <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Billing Period *</Label>
                <Input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="e.g. 2026-Q3" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Total Fee Amount (₹) *</Label>
                <Input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="25000" required />
              </div>

              <div className="space-y-1.5">
                <Label>Initial Paid Amount (₹)</Label>
                <Input type="number" min="0" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} placeholder="0" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Due Date *</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Save Fee Record"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
