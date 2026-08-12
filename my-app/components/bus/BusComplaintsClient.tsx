"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertTriangle, Search, CheckCircle2, Clock, User, Bus, Edit2 } from "lucide-react";
import { updateBusComplaintStatus } from "@/lib/actions/bus";
import { toast } from "sonner";
import { format } from "date-fns";

type Props = {
  complaints: any[];
  isSuperAdmin: boolean;
};

export function BusComplaintsClient({ complaints: initialComplaints, isSuperAdmin }: Props) {
  const [complaints, setComplaints] = useState(initialComplaints);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Admin Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("RESOLVED");
  const [adminRemarks, setAdminRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const filteredComplaints = complaints.filter((c) => {
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesSearch =
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase()) ||
      c.bus?.bus_number?.toLowerCase().includes(search.toLowerCase()) ||
      c.driver?.full_name?.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  function openUpdateModal(complaint: any) {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status || "RESOLVED");
    setAdminRemarks(complaint.admin_remarks || "");
    setModalOpen(true);
  }

  async function handleUpdateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedComplaint) return;

    setSubmitting(true);
    const res = await updateBusComplaintStatus({
      complaint_id: selectedComplaint.id,
      status: newStatus,
      admin_remarks: adminRemarks || undefined,
    });

    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Complaint status updated.");
      setModalOpen(false);
      window.location.reload();
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Complaint, Bus, Driver..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val || "all")}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="ACKNOWLEDGED">Acknowledged</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Complaints Feed */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Driver Bus Breakdown Complaints ({filteredComplaints.length})
          </CardTitle>
          <CardDescription>Reported vehicle issues, breakdown alerts, and resolution status</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredComplaints.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No complaints found matching filters.</p>
          ) : (
            <div className="space-y-3">
              {filteredComplaints.map((c) => (
                <div key={c.id} className="p-4 rounded-xl border bg-card space-y-2 hover:border-primary/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-bold flex items-center gap-1">
                        <Bus className="w-3.5 h-3.5" /> {c.bus?.bus_number || "BUS"}
                      </Badge>
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200">{c.category}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="w-3.5 h-3.5" /> {c.driver?.full_name || "Driver"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className={
                        c.status === "RESOLVED" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                        c.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700 border-blue-200" :
                        c.status === "ACKNOWLEDGED" ? "bg-cyan-100 text-cyan-700 border-cyan-200" :
                        c.status === "REJECTED" ? "bg-rose-100 text-rose-700 border-rose-200" :
                        "bg-amber-100 text-amber-700 border-amber-200"
                      }>
                        {c.status}
                      </Badge>

                      {isSuperAdmin && (
                        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => openUpdateModal(c)}>
                          <Edit2 className="w-3 h-3" /> Update Status
                        </Button>
                      )}
                    </div>
                  </div>

                  <h4 className="font-bold text-sm text-foreground">{c.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{c.description}</p>

                  {c.admin_remarks && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-xs text-emerald-800 dark:text-emerald-300 border border-emerald-200 mt-2">
                      <strong>Admin Resolution Remarks:</strong> {c.admin_remarks}
                    </div>
                  )}

                  <p className="text-[11px] text-muted-foreground pt-1">
                    Submitted on {format(new Date(c.created_at), "dd MMM yyyy, hh:mm a")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Resolution Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Update Driver Complaint Status</DialogTitle>
            <DialogDescription>Acknowledge or resolve driver breakdown alert.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Status *</Label>
              <Select value={newStatus} onValueChange={(val: any) => setNewStatus(val || "RESOLVED")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">PENDING</SelectItem>
                  <SelectItem value="ACKNOWLEDGED">ACKNOWLEDGED</SelectItem>
                  <SelectItem value="IN_PROGRESS">IN PROGRESS</SelectItem>
                  <SelectItem value="RESOLVED">RESOLVED</SelectItem>
                  <SelectItem value="REJECTED">REJECTED</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Admin Resolution Remarks</Label>
              <Textarea placeholder="Enter action taken, maintenance dispatched, or resolution notes..." value={adminRemarks} onChange={(e) => setAdminRemarks(e.target.value)} rows={3} />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Updating..." : "Save Status"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
