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
import { AlertCircle, Plus, Search, CheckCircle2, Clock, Wrench } from "lucide-react";
import { createHostelComplaint, updateComplaintStatus } from "@/lib/actions/hostel";
import { toast } from "sonner";
import { format } from "date-fns";

type Props = {
  complaints: any[];
  isWarden: boolean;
  userHostelId?: string;
};

export function HostelComplaintsClient({ complaints, isWarden, userHostelId }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Warden Update Status Modal
  const [updateOpen, setUpdateOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("resolved");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Student New Complaint Modal
  const [newOpen, setNewOpen] = useState(false);
  const [category, setCategory] = useState("maintenance");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");

  const filteredComplaints = complaints.filter((c) => {
    const q = search.toLowerCase();
    const nameMatch = (c.profiles?.full_name || "").toLowerCase().includes(q);
    const descMatch = (c.description || "").toLowerCase().includes(q);
    const catMatch = (c.category || "").toLowerCase().includes(q);

    const matchesSearch = nameMatch || descMatch || catMatch;
    const matchesStatus = statusFilter === "all" || c.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesCategory = categoryFilter === "all" || c.category.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesCategory;
  });

  async function handleUpdateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedComplaint) return;

    setSubmitting(true);
    const res = await updateComplaintStatus(selectedComplaint.id, newStatus, remarks);
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`Complaint status updated to "${newStatus.replace("_", " ")}"`);
      setUpdateOpen(false);
      setSelectedComplaint(null);
      setRemarks("");
    }
  }

  async function handleNewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description || description.trim().length < 10) {
      toast.error("Description must be at least 10 characters.");
      return;
    }

    setSubmitting(true);
    const res = await createHostelComplaint({
      hostel_id: userHostelId || complaints[0]?.hostel_id,
      category,
      description,
      priority,
    });
    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Hostel complaint submitted successfully.");
      setNewOpen(false);
      setDescription("");
    }
  }

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search Student, Category, Description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val || "")}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={(val: any) => setCategoryFilter(val || "")}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="All Categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="cleanliness">Cleanliness</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="noise">Noise</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!isWarden && (
            <Button onClick={() => setNewOpen(true)} className="gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" /> Raise Complaint
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Complaints List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Hostel Complaints ({filteredComplaints.length})</CardTitle>
          <CardDescription>Reported maintenance, cleanliness, and security issues</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredComplaints.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No complaints found matching filters.</p>
          ) : (
            <div className="space-y-3">
              {filteredComplaints.map((c) => (
                <div key={c.id} className="p-4 rounded-xl border space-y-2 bg-card hover:border-primary/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{c.profiles?.full_name || "Student"}</span>
                      <span className="text-xs text-muted-foreground font-mono">({c.profiles?.roll_number || "STU"})</span>
                      <Badge variant="outline" className="capitalize text-xs">{c.category}</Badge>
                      <Badge variant="secondary" className="capitalize text-[10px]">{c.priority || "medium"} Priority</Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className={
                        c.status === "resolved" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                        c.status === "in_progress" ? "bg-blue-100 text-blue-700 border-blue-200" :
                        "bg-amber-100 text-amber-700 border-amber-200"
                      }>
                        {c.status.replace("_", " ").toUpperCase()}
                      </Badge>
                      {isWarden && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs gap-1"
                          onClick={() => {
                            setSelectedComplaint(c);
                            setNewStatus(c.status || "resolved");
                            setRemarks(c.resolution_remarks || "");
                            setUpdateOpen(true);
                          }}
                        >
                          Update Status
                        </Button>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-foreground leading-relaxed">{c.description}</p>

                  {c.resolution_remarks && (
                    <div className="p-2.5 rounded-lg bg-muted/60 text-xs text-muted-foreground border">
                      <span className="font-semibold text-foreground">Warden Remarks:</span> {c.resolution_remarks}
                    </div>
                  )}

                  <p className="text-[11px] text-muted-foreground">
                    Submitted on {format(new Date(c.created_at), "dd MMM yyyy, hh:mm a")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Update Status Modal (Warden) */}
      <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Update Complaint Status</DialogTitle>
            <DialogDescription>Change status and add resolution remarks for warden records.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Status *</Label>
              <Select value={newStatus} onValueChange={(val: any) => setNewStatus(val || "")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open / Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="remarks">Resolution Remarks / Notes</Label>
              <Textarea
                id="remarks"
                placeholder="State resolution details or status notes..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setUpdateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Updating..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Raise Complaint Modal (Student) */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Raise Hostel Complaint</DialogTitle>
            <DialogDescription>Submit maintenance or cleanliness complaint to Warden.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleNewSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Select value={category} onValueChange={(val: any) => setCategory(val || "")}>
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
                <Select value={priority} onValueChange={(val: any) => setPriority(val || "")}>
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
              <Textarea
                placeholder="Provide specific details of the issue..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setNewOpen(false)}>Cancel</Button>
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
